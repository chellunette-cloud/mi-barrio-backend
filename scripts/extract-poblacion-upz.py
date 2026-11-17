"""Extrae los quinquenios de la UPZ 082 (2025) desde la fuente oficial F-03.

Uso:
    python scripts/extract-poblacion-upz.py [ruta-al-archivo.ods]

Sin argumento descarga el ODS oficial. El resultado se escribe en
data/source/poblacion-upz-082-2025.json para que el ETL y la API lo consuman
con verificación SHA-256.
"""
from __future__ import annotations

import hashlib
import io
import json
import re
import sys
import urllib.request
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

URL = (
    "https://datosabiertos.bogota.gov.co/dataset/"
    "0f1fb76a-1595-43d5-9257-0abcc3db908a/resource/"
    "96583ea9-9c0b-40c3-9797-156d173eb734/download/"
    "202503_upz_proyeccion_retroproyeccion_poblacion_2005_2035.ods"
)
DATASET_URL = "https://datosabiertos.bogota.gov.co/dataset/0f1fb76a-1595-43d5-9257-0abcc3db908a"
CONSULTED_AT = "2026-11-15"
UPZ_CODE = "82"
YEAR = "2025"
TABLE_NS = "{urn:oasis:names:tc:opendocument:xmlns:table:1.0}"
TEXT_NS = "{urn:oasis:names:tc:opendocument:xmlns:text:1.0}"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "source" / "poblacion-upz-082-2025.json"


def download() -> bytes:
    with urllib.request.urlopen(URL, timeout=120) as response:
        return response.read()


def read_cells(row: ET.Element) -> list[str]:
    cells: list[str] = []
    for cell in row.findall(f"{TABLE_NS}table-cell"):
        repeat = int(cell.get(f"{TABLE_NS}number-columns-repeated", "1"))
        text = " ".join("".join(part.itertext()) for part in cell.findall(f"{TEXT_NS}p"))
        cells.extend([text] * repeat)
    return cells


def find_data(content: bytes) -> tuple[list[str], list[str]]:
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        root = ET.fromstring(archive.read("content.xml"))
    table = root.find(f".//{TABLE_NS}table")
    if table is None:
        raise SystemExit("El ODS no contiene una tabla")
    rows = [read_cells(row) for row in table.findall(f"{TABLE_NS}table-row")]
    header_index = next(
        (index for index, cells in enumerate(rows) if "Código UPZ" in cells),
        None,
    )
    if header_index is None:
        raise SystemExit("No se encontró el encabezado Código UPZ")
    header = rows[header_index]
    for cells in rows[header_index + 1:]:
        if (
            len(cells) > 9
            and cells[6].lstrip("0") == UPZ_CODE
            and cells[9] == YEAR
            and "KENNEDY" in cells[5].upper()
        ):
            return header, cells
    raise SystemExit("No se encontró la UPZ 082 para 2025")


def build_groups(header: list[str], row: list[str]) -> list[dict[str, object]]:
    males: dict[str, int] = {}
    females: dict[str, int] = {}
    order: list[str] = []
    for index, name in enumerate(header):
        match = re.match(r"^(Hombres|Mujeres)_(.+)$", name)
        if not match or index >= len(row):
            continue
        sex, age = match.groups()
        if sex == "Hombres":
            males[age] = int(row[index])
            order.append(age)
        else:
            females[age] = int(row[index])
    if not order or set(order) != set(females):
        raise SystemExit("Los quinquenios de hombres y mujeres no coinciden")
    return [
        {"edad": age, "hombres": males[age], "mujeres": females[age], "total": males[age] + females[age]}
        for age in order
    ]


def main() -> None:
    source = Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else download()
    header, row = find_data(source)
    groups = build_groups(header, row)
    men = sum(int(group["hombres"]) for group in groups)
    women = sum(int(group["mujeres"]) for group in groups)
    if (men, women) != (66175, 66955):
        raise SystemExit(f"Totales inesperados: {men} hombres, {women} mujeres")
    payload = {
        "nivel": "upz",
        "codigo": "082",
        "nombre": row[7],
        "localidad": row[5],
        "anio": int(YEAR),
        "area": row[8],
        "poblacion": {"valor": men + women, "hombres": men, "mujeres": women},
        "grupos": groups,
        "fuente": "F-03",
        "url": URL,
        "datasetUrl": DATASET_URL,
        "consultedAt": CONSULTED_AT,
        "licencia": "CC BY 4.0",
        "archivoOrigenSha256": hashlib.sha256(source).hexdigest().upper(),
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest().upper()
    print(f"OK {OUTPUT.relative_to(ROOT)} {digest}")


if __name__ == "__main__":
    main()
