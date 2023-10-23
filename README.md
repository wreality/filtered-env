<!-- start title -->

# GitHub Action: filtered-env

<!-- end title -->
<!-- start badges -->

<a href="https://github.com/wreality/filtered-env/releases/latest"><img src="https://img.shields.io/github/v/release/wreality/filtered-env?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release" /></a><a href="https://github.com/wreality/filtered-env/releases/latest"><img src="https://img.shields.io/github/release-date/wreality/filtered-env?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release" /></a><img src="https://img.shields.io/github/last-commit/wreality/filtered-env?logo=github&style=flat-square" alt="Commit" /><a href="https://github.com/wreality/filtered-env/issues"><img src="https://img.shields.io/github/issues/wreality/filtered-env?logo=github&style=flat-square" alt="Open Issues" /></a><img src="https://img.shields.io/github/downloads/wreality/filtered-env/total?logo=github&style=flat-square" alt="Downloads" />

<!-- end badges -->
[![GitHub Super-Linter](https://github.com/wreality/filtered-env/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/wreality/filtered-env/actions/workflows/ci.yml/badge.svg)
<!-- start description -->

Use docker tags and a Github envionment variable to create a list of environments to deploy to

<!-- end description -->

<!-- start contents -->

<!-- end contents -->

<!-- start usage -->

```yaml
- uses: wreality/filtered-env@v0.0.1
  with:
    tags: ""

    token: ""

    # Default: TAG_REGEX
    environment_variable: ""

    environments: ""

    # Default: false
    include_no_regex: ""
```

<!-- end usage -->

<!-- start inputs -->

| \***\*Input\*\***          | \***\*Description\*\***                                                                  | \***\*Default\*\*** | \***\*Required\*\*** |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| `**tags**`                 | Tags (usually from docker metadata action)                                               |                     | **true**             |
| `**token**`                | Github token with repo read permissions                                                  |                     | **true**             |
| `**environment_variable**` | Github environment variable that contains the regex to match                             | `TAG_REGEX`         | **false**            |
| `**environments**`         | Comma separated list of environments to match against (fetched from API if not provided) |                     | **false**            |
| `**include_no_regex**`     | Include environments in output that do not have a regex variable                         |                     | **false**            |

<!-- end inputs -->

<!-- start outputs -->

| \***\*Output\*\*** | \***\*Description\*\***                           |
| ------------------ | ------------------------------------------------- |
| `**environments**` | JSON srtring of environments that match the regex |

<!-- end outputs -->

<!-- start [.github/ghadocs/examples/] -->

<!-- end [.github/ghadocs/examples/] -->
