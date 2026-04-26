from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class RepositoryCheckout:
    path: Path
    created_clone: bool


def prepare_repository(source: str, workspace: Path, *, ref: str | None = None) -> RepositoryCheckout:
    source_path = Path(source).expanduser()
    if source_path.exists():
        return RepositoryCheckout(path=source_path.resolve(), created_clone=False)

    workspace.mkdir(parents=True, exist_ok=True)
    repo_path = workspace / _repo_dir_name(source)
    if repo_path.exists():
        shutil.rmtree(repo_path)
    subprocess.run(["git", "clone", source, str(repo_path)], check=True)
    if ref:
        subprocess.run(["git", "checkout", ref], cwd=repo_path, check=True)
    return RepositoryCheckout(path=repo_path.resolve(), created_clone=True)


def cleanup_repository(checkout: RepositoryCheckout, workspace: Path) -> None:
    if not checkout.created_clone:
        return

    if checkout.path.exists():
        shutil.rmtree(checkout.path)

    try:
        workspace.rmdir()
    except OSError:
        pass


def _repo_dir_name(source: str) -> str:
    name = source.rstrip("/").split("/")[-1]
    if name.endswith(".git"):
        name = name[:-4]
    return name or "repo"
