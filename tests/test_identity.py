from pathlib import Path


ROOT = Path(__file__).parents[1]
EXCLUDED_MARKERS = (
    bytes((98, 101, 97, 99, 111, 110)).decode(),
    bytes((112, 114, 111, 111, 102, 114, 97, 105, 108)).decode(),
)


def test_project_has_independent_identity():
    for path in ROOT.rglob("*"):
        if any(part in {"__pycache__", ".pytest_cache", ".git"} for part in path.parts):
            continue
        assert all(marker not in path.name.casefold() for marker in EXCLUDED_MARKERS)
        if path.is_file():
            text = path.read_text(encoding="utf-8").casefold()
            assert all(marker not in text for marker in EXCLUDED_MARKERS)
