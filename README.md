# oculus-intertenerius

Tiny microblog about the movies I have seen, moved here from blogger
and maintained with a couple of npm scripts.

## useful scripts

* `npm run check-integrity` - [C] check validity of markdown files
* `npm run json-query` - [Q] run predefined queries
* `npm run add-new` - [A] create new article skeleton
* `npm run import-blogger-xml` - import last xml file from the `xml` folder
* `npm run export-to-mongo` - export jsons into `oculus-intertenerius` db, `posts` collection
* `npm run dev` - serve the static docs folder
* `scripts/lazy.sh` - commit, lint and push the newly added post

## env vars

* `EDITOR`
* `GUI_EDITOR` - takes precedence over editor; example: `geany`
* `DB_URL` - mongo connection string; example: `mongodb://localhost:27017`

Use _.env_ to set, without overriding.

## microformat

1. markdown heading 1:  title - i18n title - movie year
2. empty line
3. text: Short review, may contain multiple paragraphs
4. empty line
5. date in YYYY-MM-DD format
6. empty line
7. markdown line separator
8. empty line
9. comma separated list of tags in brackets
10. trailing line break (optional)
