# Wavefront Datasource Plugin for Grafana

This plugin enables [Wavefront](https://www.wavefront.com) as a Grafana 4 datasource.

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
