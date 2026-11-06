#!/usr/bin/env bash
set -euo pipefail

readonly installer_ref=f6297e0d27491a5565651b5f941cffc4a9296f63
readonly installer_sha256=160c81ad064eb0a1d5f775775f3cf8922bc234387d29f74d477a186b49ddcf6b
readonly installer_url="https://raw.githubusercontent.com/x-aijishu/jishushell/${installer_ref}/install/jishu-install.sh"

show_help() {
  cat <<'HELP'
Install JishuShell on Linux ARM64, then open http://<BOARD_IP>:8090.

Usage: bash scripts/install-jishushell.sh [--check | --dry-run | --help]
  no option   Reuse an existing installation, or run the official installer.
  --check     Check the existing installation and local panel without installing.
  --dry-run   Verify the pinned official installer and display its install plan.

The official installer prepares Node.js, Docker, Nomad, the OpenClaw runtime,
and system services. It may request sudo credentials and installation choices.
Administrator password and model API key are entered later in the web panel.
HELP
}

mode=${1:-install}
case "$mode" in
  --help|-h) show_help; exit 0 ;;
  install|--check|--dry-run) ;;
  *) show_help >&2; exit 2 ;;
esac
[[ $# -le 1 ]] || { show_help >&2; exit 2; }
[[ $(uname -s) == Linux ]] || { echo 'This entry point supports Linux ARM64.' >&2; exit 1; }
case $(uname -m) in aarch64|arm64) ;; *) echo 'This entry point supports Linux ARM64.' >&2; exit 1 ;; esac

panel_port=${JISHUSHELL_PANEL_PORT:-8090}
[[ $panel_port =~ ^[0-9]+$ ]] && (( panel_port > 0 && panel_port < 65536 )) || { echo 'Invalid panel port.' >&2; exit 1; }
print_panel() {
  local board_ip
  board_ip=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
  printf 'Panel on this device: http://localhost:%s\n' "$panel_port"
  if [[ -n $board_ip ]]; then printf 'Panel from your PC: http://%s:%s\n' "$board_ip" "$panel_port"; fi
}

jishu_bin=$(command -v jishushell || true)
if [[ -z $jishu_bin && -x $HOME/.jishushell/bin/jishushell ]]; then jishu_bin=$HOME/.jishushell/bin/jishushell; fi
if [[ -n $jishu_bin && $mode != --dry-run ]]; then
  echo 'Existing JishuShell found; no reinstallation or application deletion performed.'
  "$jishu_bin" version
  print_panel
  if [[ $mode == --check ]]; then
    command -v curl >/dev/null || { echo 'curl is required for the panel check.' >&2; exit 1; }
    curl --fail --silent --show-error --max-time 10 "http://127.0.0.1:${panel_port}/" >/dev/null
    echo 'PASS: local JishuShell panel responds.'
  fi
  exit 0
fi
if [[ $mode == --check ]]; then echo 'JishuShell is not installed for this user.' >&2; exit 1; fi

command -v curl >/dev/null || { echo 'Install curl first.' >&2; exit 1; }
command -v sha256sum >/dev/null || { echo 'sha256sum is required.' >&2; exit 1; }
installer=$(mktemp)
trap 'rm -f -- "$installer"' EXIT
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
  --connect-timeout 20 --max-time 180 --retry 2 "$installer_url" -o "$installer"
printf '%s  %s\n' "$installer_sha256" "$installer" | sha256sum --check --status || { echo 'Official installer checksum mismatch; refused to execute.' >&2; exit 1; }

args=(--jishushell-version 0.8.7 --no-autologin)
if [[ $mode == --dry-run ]]; then
  # The upstream script supports sourcing its helpers. Display only the plan;
  # its full --dry-run main path still asks for sudo on a non-interactive host.
  bash -c '
    source "$1"
    parse_args --dry-run --jishushell-version 0.8.7 --no-autologin
    detect_os
    detect_arch
    show_install_plan --with-jishushell
  ' -- "$installer" </dev/null
  echo 'Plan only; no installation performed.'
  exit 0
elif ( : </dev/tty ) 2>/dev/null; then
  bash "$installer" "${args[@]}" </dev/tty
else
  bash "$installer" "${args[@]}" </dev/null
fi
print_panel
echo 'Open the panel to set your administrator password, add a model, and create an OpenClaw application.'
