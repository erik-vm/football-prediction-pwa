FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY FootballPrediction.sln ./
COPY src/FootballPrediction.Api/FootballPrediction.Api.csproj src/FootballPrediction.Api/
COPY src/FootballPrediction.Application/FootballPrediction.Application.csproj src/FootballPrediction.Application/
COPY src/FootballPrediction.Domain/FootballPrediction.Domain.csproj src/FootballPrediction.Domain/
COPY src/FootballPrediction.Infrastructure/FootballPrediction.Infrastructure.csproj src/FootballPrediction.Infrastructure/
COPY tests/FootballPrediction.Tests/FootballPrediction.Tests.csproj tests/FootballPrediction.Tests/

RUN dotnet restore src/FootballPrediction.Api/FootballPrediction.Api.csproj

COPY . .
RUN dotnet publish src/FootballPrediction.Api/FootballPrediction.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FootballPrediction.Api.dll"]
