-- Migrate client-site in-memory data to server-side in-memory

[X] Load site with data from server
    [X] Create the core structs
        []X Team
        [X] TeamEpic
        [X] Epic
    [X] Retrieve and load site from Routes

[] Create data on the server
    [] TeamEpic
    [] Upstream Dependency
    [] Downstream Dependency
    [] Team
    [] Save data back to JSON file

[] Add ability to update server data
    [] Update Team Name
    [] Update Epic Name
    [] Update Epic Downstream Dependency
    [] Update Epic Upstream Dependency

========
NEXT
========

[] Migrate to MongoDB

[] Add ability to delete data from site
    [] Delete Team
    [] Delete Epic
    [] Delete Upstream Dependency
    [] Delete Downstream Dependency


[] Dependency conflicts
    [] Highlight conflicts between epics that end after upstream start dependency
    [] Highlight conflicts between epics that start after upstream dependency
    [] Use multiple rows when epics over-lap

[] (Client-side) Update Epic details in the
    [] Change Epic Start date
    [] Change Epic size using a drop-down

[] Save Epic detail changes to the server

[] Create new Team via CreateTeam button


[] FIX: Put dependency connections on top of the epics after new epic created

[] FIX: Scrollbars

[] Edit team name by clicking on the Team Name directly

--

[] Capture Quarterly Planning info
    [] Learning
    [] Conflicts/Resolved (Treat this like a task list with owners and target dates)
    [] Decisions
    [] Simplified Roadmap (condensed)
    [] Release plan-view

[] Add annotations (e.g. conflict/accepted) to epics (the Red/Green stars)

[] Side-pandel dependencies
    [] Update UI to single button for showing the Add Dependency Dialog

[] Closing the Side-Pandel will Undim and unhighligh all epics

[] Mouse-over epic shows full-details (useful for when epic's name is truncated)

========
 OPPORTUNITIES
========

[] Read Team Epics from JIRA

[] Write Team Epic changes to JIRA

[] Sync change with JIRA

[] Side-Panels
    [] Collapse Team side-panel
    [] Add Sticky Team name
    [] Highlight related Team when side-pandel is open

[] Projected End Date field
    [] Edit Projected End field
    [] Sync-epic size to align with week boundary

[] Dragging epics
    [] Move epics to new week
    [] Extend epics by dragging end
    [] Move epics to different teams

[] Start a Quarterly Planning Event
    [] Define period
    [] Load Teams
        [] From Previous planning events
    [] Load Epics from

[] Side-panel dependencies
    [] Remove Upstream dependency
    [] Remove Downstream dependency

[] Explore Progress Dashboard?

[] Esc Key
    [] Cancel Edit Name changes
        [] Team name
        [] Epic Name
    [] Dismiss Add Dependency dialog
    [] Dismiss Side-panel dependencies

[] Delete Key
    [] Delete Epic
    [] Delete dependency connection

[] Add filtering to the Dependency Dialog
    [] Filter epics by Team Name
    [] Filter epics by Epic Name

[] Eplore capturing snapshots/version of the plan
    [] Show deviations to the plan

[] Filter Analysis
    [] By Epic - Show me all the work impacting this epic
    [] By Epic - Show me the impact of changing this epic
    [] By Project - Show me all the work impacting this project
    [] By Team dependencies - Show me all the projects that this team is impacting

[] Collapse Teams that are not a dependency when an epic is selected

[] Explore addition of excel fields

[] Explore Decision/Action log

[] Explore Risk log

[] Explore Summary Report based on Epic clashes

[] Explore adding projects to Epic and view of the projects

[] Explore adding Team Health & other related views to identify how to support teams

[] Explore adding Business Area metrics



========
 DONE
========

--

[X] Select epic
    [X] Highlight selected epic
    [X] Highlight Upstream dependencies
    [X] Highlight Downstream dependencies
    [X] Highlight related team
    [X] Dim the unrelated epics
    [X] Dim dependency connections for teams that are not a dependency
        [X] Dim Upstream dependency
        [X] Dim Downstream dependency

[X] Ensure Team name is truncated when too long

[X] Update Team UI to match new design

[X] BUG: Line separator doesn't span all the months when there are few epics in one month

[X] Create new Epic when team has zero epics

[X] Create epics
    [X] Update UX to allow adding epics based on the new design
    [X] Create new Epic at the fist position when there are other epics

[X] Add Epic Duration to Estimated Size
    [X] Update the epic size based on the estimated size
    [X] Show the epic week in side-panel
    [X] Update Projected End field
    [X] BUG: Fix border offset bug for epics

[X] Edit expected start week
    [X] Sync epic to week boundary location
    [X] Epics in multiple rows: Use multiple rows for epics with the same week as others

[X] Change week boundary to use the calendar week


[X] Week Boundaries
    [X] Update UX/UI design to incorporate week boundaries
    [X] Add week boundaries markings
    [X] Align the epics based on week boundary
    [X] Truncate Epic Name to fit SVG shape

[X] Side-panel dependencies
    [X] Add Upstream dependency
        [X] Create Dialog
        [X] Dismiss Dialog
        [X] Load data to dialog
        [X] Toggle highlighting epics
        [X] Show selected count
        [X] Save dependencies
        [X] Bug Fix
            [X] Filter the downstream epic from the list of epics so that it can't be added to itself
    [X] Add Downstream dependency

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


