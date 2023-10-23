
<!-- start title -->

# GitHub Action: matched-environments

<!-- end title -->

[![GitHub Super-Linter](https://github.com/wreality/matchedEnvironments/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/wreality/matchedEnvironments/actions/workflows/ci.yml/badge.svg)

<!-- start description -->

Use docker tags and a Github envionment variable to create a list of environments to deploy to
<!-- end description -->

<!-- start contents -->

<!-- end contents -->

<!-- start usage -->
```yaml

- uses: wreality/matchedEnvironments@v0.0.1
  with:
  tags: ''

  token: ''

  # Default: TAG_REGEX

  environment_variable: ''

  environments: ''

  # Default: false

  include_no_regex: ''

```

<!-- end usage -->

<!-- start inputs -->
| ****Input**** | ****Description**** | ****Default**** | ****Required**** |
|---|---|---|---|
| `**tags**` | Tags (usually from docker metadata action) |  | **true** |
| `**token**` | Github token with repo read permissions |  | **true** |
| `**environment_variable**` | Github environment variable that contains the regex to match | `TAG_REGEX` | **false** |
| `**environments**` | Comma separated list of environments to match against (fetched from API if not provided) |  | **false** |
| `**include_no_regex**` | Include environments in output that do not have a regex variable |  | **false** |

<!-- end inputs -->

<!-- start outputs -->
| ****Output**** | ****Description**** |
|---|---|
| `**environments**` | JSON srtring of environments that match the regex |

<!-- end outputs -->

<!-- start [.github/ghadocs/examples/] -->

<!-- end [.github/ghadocs/examples/] -->

```
