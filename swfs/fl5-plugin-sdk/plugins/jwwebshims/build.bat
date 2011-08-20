:: This is a simple script that compiles the plugin using the free Flex SDK on Windows.
:: Learn more at http://developer.longtailvideo.com/trac/wiki/PluginsCompiling

SET FLEXPATH="C:\Program Files\flex_sdk_3.6"

echo "Compiling player 5 plugin..."

%FLEXPATH%\bin\mxmlc .\JWWebshims.as -sp .\ -o .\jwwebshims.swf -library-path+=..\..\lib -load-externs ..\..\lib\jwplayer-5-classes.xml  -use-network=false

copy .\jwwebshims.swf ..\..\..\..\src\shims\swf\jwwebshims.swf