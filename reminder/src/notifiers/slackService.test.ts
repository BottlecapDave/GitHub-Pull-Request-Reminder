import { IGitHubMergeRequest } from "../githubService";
import { ISlackConfig, SlackService } from "./slackService";

function createSlackConfig(): ISlackConfig {
  return {
    target: "@here",
    webhookUrl: process.env.TEST_SLACK_WEBHOOK_URL as string,
  }
}

function createMergeRequests(): IGitHubMergeRequest[] {
  return [{
    user: {
      login: "David Kendall",
    },
    created_at: "2023-07-07T10:00:00Z",
    labels: [],
    head: {
      repo: {
        full_name: "test/github-pull-request-reminder-test",
      },
    },
    title: "Pull request with mandatory labels",
    html_url: "https://github.com/test/github-pull-request-reminder-test/-/merge_requests/1",
    draft: false,
  },
  {
    user: {
      login: "David Kendall",
    },
    created_at: "2023-07-08T11:12:00Z",
    labels: [],
    head: {
      repo: {
        full_name: "test/github-pull-request-reminder-test",
      },
    },
    title: "wip: Pull request ",
    html_url: "https://github.com/test/github-pull-request-reminder-test/-/merge_requests/2",
    draft: false,
  }]
}

describe('SlackService', () => {
  test('when webhook valid, then slack message is sent', async () => {
    const config = createSlackConfig();
    const mergeRequests = createMergeRequests();
    const service = new SlackService();

    await service.sendReminder(config, mergeRequests);
  })
})