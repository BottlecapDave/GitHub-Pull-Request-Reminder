import { IGitHubMergeRequest } from "../githubService";
import { formatDistance } from 'date-fns';
import axios, { AxiosRequestConfig } from "axios";

export interface ISlackConfig {
    webhookUrl: string;
    target: string;
}

export class SlackService {
    async sendReminder(config: ISlackConfig, mergeRequests: IGitHubMergeRequest[]) {
        const blocks = [];
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `${config.target} Looks like there are some open pull requests...`
            }
        },
        {
            type: "divider"
        });

        for (const request of mergeRequests) {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*<${request.html_url}|(${request.head.repo.full_name}) ${request.title}>*\n${request.user.login} | opened ${formatDistance(request.created_at, new Date())}`
                }
            })
        }

        const requestConfig: AxiosRequestConfig = {
            validateStatus: () => true, // Make sure we always return
        };

        await axios.post(
            config.webhookUrl,
            {
                text: "Looks like there are some open pull requests...",
                blocks
            },
            requestConfig
        );
    }
}