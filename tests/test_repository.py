from pathlib import Path
import subprocess

from code_analyzer.repository import prepare_repository


def _init_repo(repo: Path) -> None:
    repo.mkdir()
    (repo / "README.md").write_text("# Demo\n")
    subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True)
    subprocess.run(["git", "add", "."], cwd=repo, check=True)
    subprocess.run(["git", "commit", "-m", "initial"], cwd=repo, check=True, capture_output=True)


def test_prepare_repository_marks_remote_file_url_as_owned_clone(tmp_path: Path) -> None:
    source = tmp_path / "source"
    _init_repo(source)
    workspace = tmp_path / "workspace"

    checkout = prepare_repository(source.as_uri(), workspace)

    assert checkout.path.exists()
    assert checkout.created_clone is True
    assert checkout.path.parent == workspace


def test_prepare_repository_marks_local_path_as_not_owned(tmp_path: Path) -> None:
    source = tmp_path / "source"
    _init_repo(source)
    workspace = tmp_path / "workspace"

    checkout = prepare_repository(str(source), workspace)

    assert checkout.path == source.resolve()
    assert checkout.created_clone is False
    assert source.exists()
