echo "Editing config.js..."
echo "Paste your Firebase config object"
read CONFIG

echo "var config = $CONFIG" > config.js
