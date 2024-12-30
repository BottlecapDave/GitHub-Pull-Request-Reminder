import { IGitHubMergeRequestRequest, GitHubService } from "./githubService";
import { IMsTeamsConfig, MsTeamsService } from "./notifiers/msTeamsService";
import { ISlackConfig, SlackService } from "./notifiers/slackService";

export interface IReminderRequest extends IGitHubMergeRequestRequest {
    githubAccessToken: string;
    slack?: ISlackConfig;
    msTeams?: IMsTeamsConfig;
}

export class ReminderService {
    constructor(private gitlabService: GitHubService, private slackService: SlackService, private msTeamsService: MsTeamsService) {}
    
    async sendReminder(request: IReminderRequest) {
        const mergeRequests = await this.gitlabService.getMergeRequests(request.githubAccessToken, request);
    
        if (mergeRequests.length > 0) {
            if (request.slack) {
                await this.slackService.sendReminder(request.slack, mergeRequests);
            } else if (request.msTeams) {
                await this.msTeamsService.sendReminder(request.msTeams, mergeRequests);
            } else {
                throw new Error('Destination service configuration has not been set');
            }
        }
    }
}