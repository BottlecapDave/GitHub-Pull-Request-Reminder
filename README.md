# GitHub Merge Request Reminder

[![Docker Image Version (latest semver)](https://img.shields.io/docker/v/bottlecapdave/github-pull-request-reminder)](https://hub.docker.com/r/bottlecapdave/github-merge-request-reminder) [![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/bottlecapdave)

Sends a notification to a Slack webhook highlighting open pull requests for a given GitHub repository. If no pull requests are open, then no notification will be sent.

## Environment Variables

| Variable             | Details                                                                           | Example Values |
| -------------------- | --------------------------------------------------------------------------------- | -------------- |
| GITHUB_ACCESS_TOKEN  | The access token for the GitHub repository. |                |
| GITHUB_REPOS   | The GitHub repos the pull requests are for. This should be comma separated. | `bottlecapdave/github-pull-request-reminder,bottlecapdave/gitlab-merge-request-reminder` |
| INCLUDE_WIP          | Determines if work in progress pull requests should be included. This is true by default.                  | `true` or `false` |
| INCLUDE_DRAFT        | Determines if draft pull requests should be included. This is true by default.                            | `true` or `false` |
| GITHUB_MANDATORY_LABELS | The labels that pull requests must have assigned to them. All labels must be present. This should be comma separated (e.g. mandatory-label-1,mandatory-label-2) | `mandatory-label-1,mandatory-label-2` |
| GITHUB_EXCLUDED_LABELS | The labels that pull requests must not have assigned to them. Any label must be present for the merge request to be ignored. This should be comma separated (e.g. excluded-label-1,excluded-label-2) | `excluded-label-1,excluded-label-2` |
| SLACK_WEBHOOK_URL    | The URL of the slack incoming webhook to send the notification to.                                            |                |
| SLACK_TARGET         | The target of the slack message. This is `@here` by default. | `@here` |

## Docker

This is available as a docker image, available on [docker hub](https://hub.docker.com/r/bottlecapdave/github-pull-request-reminder).

## Example Uses

Because the logic is within a docker image, it can be run in a variety of places. Below I'll document examples of use.

### GitHub Action

You could create a GitHub action which is run on a schedule. For example

```
pull-request-reminder:
  stage: notify
  image: bottlecapdave/github-pull-request-reminder:latest
  only:
    refs:
      - schedules
```

## Build

You can run `npm run docker-build` to build a local docker image, which can then be run locally.

## Releases

To release a new version, merge into `main`. The github CI will then create a release based on the commitizen messages.

## Sponsorships

If you find this useful, please consider a one time or monthly [GitHub sponsorship](https://github.com/sponsors/bottlecapdave).