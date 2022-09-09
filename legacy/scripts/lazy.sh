#/usr/bin/env bash
# NOTE: calling it via npm will give us a broken pipe warning
MSG=$(ls -t posts | head -1 | sed -E s/\\s+-\\s+[0-9]{4}.md//g)
npm run build
git add --all
git commit -am "$MSG"
git push
echo have a nice day
