using Microsoft.AspNetCore.SignalR;

namespace FootballPrediction.Api.Hubs;

public class PredictionHub : Hub
{
    public async Task NotifyLeaderboardUpdate(string competitionCode)
    {
        await Clients.All.SendAsync("LeaderboardUpdated", competitionCode);
    }

    public async Task NotifyMatchUpdate(string matchId)
    {
        await Clients.All.SendAsync("MatchUpdated", matchId);
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
