@echo off
setlocal EnableDelayedExpansion
:: ^-- 1. ENABLE DELAYED EXPANSION at the top

:: 1. SET YOUR FOLDER PATHS
:: These paths are relative to where the batch file is.
SET "IN_DIR=in"
SET "OUT_DIR=out"

:: 2. SET FFMPEG PARAMETERS
:: These are the settings from our previous conversation
:: - Scale to 720px wide
:: - CRF 36 (small file, lower quality)
:: - 25 fps
:: - 64k audio
SET "PARAMS=-vf "scale=720:-1" -c:v libvpx-vp9 -crf 36 -b:v 0 -r 25 -c:a libopus -b:a 64k"

:: --- SCRIPT ---

:: Check if ffmpeg is available
ffmpeg -version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: ffmpeg.exe was not found.
    echo Please make sure ffmpeg is in your system's PATH
    echo or in the same folder as this batch file.
    echo.
    goto :end
)

:: Create the output directory if it doesn't exist
IF NOT EXIST "%OUT_DIR%" (
    echo Creating output directory: %OUT_DIR%
    mkdir "%OUT_DIR%"
)

echo Starting batch conversion...
echo.

:: Loop through all .mp4 files in the input directory
FOR %%F IN ("%IN_DIR%\*.mp4") DO (
    echo Converting "%%F"...
    
    :: %%~nF extracts just the filename (e.g., "video1")
    SET "OUT_FILE=%OUT_DIR%\%%~nF.webm"
    
    :: Run the ffmpeg command
    :: v-- 2. USE ! EXCLAMATION MARKS ! to get the "live" value
    ffmpeg -i "%%F" %PARAMS% "!OUT_FILE!"
    
    echo Output saved to "!OUT_FILE!"
    echo.
)

echo.
echo All conversions complete!
echo.

:end
:: Remove the "REM" from the line below if you want the window to stay open
pause
endlocal