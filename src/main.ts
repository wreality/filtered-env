import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const tags: string[] = parseMultiline(
      core.getInput('tags', { required: true })
    )
    const token: string = core.getInput('token', { required: true })

    const envVar: string = core.getInput('environment_variable')
    const environments: string[] =
      parseMultiline(core.getInput('environments')) || fetchEnvironments()
    const includeNoMatch: boolean = !!core.getInput('include_no_match')
    core.debug(`tags: ${tags}`)
    core.debug(`envVar: ${envVar}`)
    core.debug(`environments: ${environments}`)
    core.debug(`includeNoMatch: ${includeNoMatch}`)

    const octokit = github.getOctokit(token)

    const { owner, repo } = github.context.repo

    const result = await octokit.rest.repos.get({
      owner,
      repo
    })

    const repository_id = result.data.id

    const matchingEnvironments = environments.filter(
      async (environment_name: string) => {
        const result = await octokit.rest.actions.getEnvironmentVariable({
          repository_id,
          environment_name,
          name: envVar
        })

        const regex = result.data.value

        if (!regex && includeNoMatch) {
          return true
        }

        return tags.some((tag: string) => {
          const match = tag.match(regex)
          core.debug(`tag: ${tag} regex: ${regex} match: ${match}`)
          return !!match
        })
      }
    )

    core.debug(`environments: ${matchingEnvironments}`)

    core.setOutput('environments', JSON.stringify(matchingEnvironments))

    async function fetchEnvironments(): Promise<string[]> {
      const result = await octokit.rest.repos.getAllEnvironments({
        owner,
        repo
      })

      return result.data.environments?.map((env: any) => env.name) ?? []
    }

    function parseMultiline(input: string): string[] {
      return input
        .split(/\r?\n/)
        ?.map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
