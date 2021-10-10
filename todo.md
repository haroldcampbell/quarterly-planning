[] Edit Names
    [X] Team Name
    [] Epic Name

[] Create new Team
[] Create new Epic

[] Side-panel dependencies
    [] Add Upstream dependency
    [] Add Downstream dependency

[] Week Boundaries
    [] Add week boundaries markings
    [] Align the epics based on week boundary
    [] Edit expected start week
        [] Sync-epic to new week boundary location
        [] Highlight conflicts between epics that start after upstream dependency
[] Add Epic Duration to Estimated Size
    [] Update the epic size based on the estimated size
    [] Update Projected End field

[] Edit Projected End field
    [] Sync-epic size to align with week boundary
    [] Highlight conflicts between epics that end after upstream start dependency

[] Highlight selected epic
    [] Highlight Upstream dependencies
    [] Highlight Downstream dependencies
    [] Hide dependency connections for teams that are not a dependency
        [] Hide Upstream dependency
        [] Hide Downstream dependency
    [] Hide Teams that are not a dependency

[] Delete Team
[] Delete Epic
[] Delete Side-panel dependencies
    [] Delete Upstream dependency
    [] Delete Downstream dependency

[] Migrate client-site in-memory data to server-side in-memory
    [] Identify APIs
        [] CRUD Team
        [] CRUD Team.Epic
        [] CRUD TeamEpic.Upstream Dependency
        [] CRUD TeamEpic.Downstream Dependency
    [] Create routes

[] Migrate to MongoDB

[] Fix lines to be pretty

[] Explore addition of excel fields

[] Explore Decision log
