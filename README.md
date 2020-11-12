# Wavefront Datasource Plugin for Grafana

This plugin enables [Wavefront](https://www.wavefront.com) as a Grafana datasource supporting Grafana v6.

## Development
- `git checkout`
- `brew install node`
- `npm install`
- Update files
- `npm run build`

## Installation
- Copy the dist folder to your grafana plugin directory (ie: `/usr/local/var/lib/grafana/plugins/wavefront-datasource`)
- Restart grafana 


## Adding Datasource via CLI
```json
curl  -H "Content-Type: application/json" --user admin:admin 'http://localhost:3000/api/datasources' -X POST -d  '{"name":"wavefront","type":"wavefront-datasource","url":"https://try.wavefront.com","access":"direct","jsonData":{"wavefrontToken":"TOKEN_GOES_HERE"},"secureJsonFields":{}}'
```

## Datasource support
- Use graphical query builder, or text editor mode to create Wavefront Query Language expressions
- Supports dashboard variables using Grafana standard syntax: `$varname` or `[[varname]]`
- Supports dashboard templating via variables
- Supports dynamic variables list via queries
- Known limitations of dashboard variables:
	- Multi-mode is only supported when variable is used for templating (repeat rows / charts)
	- All mode (blank) is supported when variable is used for templating (repeat rows / charts)
	- All mode with `*` for value, when variable is used within a query
	- Value groups/tags is not supported via Grafana interface. Use query instead.
- Dashboard variable query syntax:
	- *metric* lists: `metrics: ts(...)`
	- *source* lists: `sources: ts(...)`
	- *source tag* lists: `sourceTags: ts(...)`
	- *matching source tag* lists: `matchingSourceTags: ts(...)`
	- *tag name* lists: `tagNames: ts(...)`
	- *tag value* lists: `tagValues(<tag>): ts(...)`
	- The `s` at the end of each query type is optional
	- Support for all lowercase. You can use `tagnames` or `tagNames`, but not `TAGNAMES`.
	- whitespaces around the `:` is optional

