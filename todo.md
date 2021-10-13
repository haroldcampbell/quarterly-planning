[] Side-panel dependencies
    [] Add Upstream dependency
        [X] Create Dialog
        [X] Dismiss Dialog
        [] Load data to dialog
        [] Toggle highlighting epics
        [] Show selected count
        [] Save dependencies
    [] Add Downstream dependency
    [] Filtering
        [] Filter epics by Team Name
        [] Filter epics by Epic Name

========
NEXT
========

[] Week Boundaries
    [] Add week boundaries markings
    [] Align the epics based on week boundary
    [] Edit expected start week
        [] Sync-epic to new week boundary location
        [] Highlight conflicts between epics that start after upstream dependency

[] Create new Team
    [] Create new Epic when team has zero epics

[] Create new Epic at the fist position when there are other epics

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

[] Migrate client-site in-memory data to server-side in-memory
    [] Identify APIs
        [] CRUD Team
        [] CRUD Team.Epic
        [] CRUD TeamEpic.Upstream Dependency
        [] CRUD TeamEpic.Downstream Dependency
    [] Create routes

[] Migrate to MongoDB

[] Delete Team
[] Delete Epic
[] Side-panel dependencies
    [] Remove Upstream dependency
    [] Remove Downstream dependency

[] Cancel Edit Name changes with Esc key
    [] Team name
    [] Epic Name

[] FIX: Put dependency connections on top of the epics after new epic created

[] Add annotations (e.g. conflict/accepted) to epics (the Red/Green stars)

========
 OPPORTUNITIES
========

[] Eplore capturing snapshots/version of the plan
    [] Show deviations to the plan

[] Filter Analysis
    [] By Epic - Show me all the work impacting this epic
    [] By Epic - Show me the impact of changing this epic
    [] By Project - Show me all the work impacting this project
    [] By Team dependencies - Show me all the projects that this team is impacting

[] Explore addition of excel fields

[] Explore Decision/Action log

[] Explore Risk log

[] Explore Summary Report based on Epic clashes

[] Expore adding projects to Epic and view of the projects



========
 DONE
========

[X] Create new Epic
    [X] In team with existing epic
        [X] at the last position
        [X] middle
    [X] relayout the add-epic button when an epic's size changes

[X] FIX: Make lines to be pretty

[X] Edit Names
    [X] Team Name
    [X] Epic Name
    [X] Consistency check
        [X] Team Name in Upstream dependency
        [X] Team Name in Downstream dependency
        [X] Epic Name in Upstream dependency
        [X] Epic Name in Downstream dependency


