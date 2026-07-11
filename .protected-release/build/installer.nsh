!macro customInstall
  ; Create a launcher inside the chosen install folder.
  StrCpy $0 "$INSTDIR\${SHORTCUT_NAME}.lnk"
  ${IfNot} ${FileExists} "$0"
    CreateShortCut "$0" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
  ${EndIf}

  ; Also place a launcher at the install drive root so removable-drive installs
  ; are easy to open directly from the flash drive / external disk.
  StrCpy $1 $INSTDIR 3
  StrCpy $2 "$1${SHORTCUT_NAME}.lnk"
  ${If} "$2" != "$0"
  ${AndIfNot} ${FileExists} "$2"
    CreateShortCut "$2" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
  ${EndIf}
!macroend

!macro customUnInstall
  Delete "$INSTDIR\${SHORTCUT_NAME}.lnk"
  StrCpy $0 $INSTDIR 3
  Delete "$0${SHORTCUT_NAME}.lnk"
!macroend
