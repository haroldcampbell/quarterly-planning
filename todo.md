[] FIX: Side-pandel height becomes too long when number of teams is long

========
NEXT
========

[] Add team-specific Side-panel to deal with clicking on Team name
    [] Change team name
    [] Allow deleting team

[] Capture Quarterly Planning Learning
    [] Save learning
    [] View learnings
    [] Edit learning
    [] Delete learning
    [] Add action
    [] Add action owner
    [] Check-off actions
    [] Delete action
    [] Change action owner

[] Resolving conflicts
    [] Decisions -> Goes to a decision log?
    [] Add note to Epic -> This should show up in a separate Kanban board that is linked to the epic
    [] Add flag to Epic based on conflict state
    [] Conflicts/Resolved (Treat this like a task list with owners and target dates)

[] Valuestream Features
    [] Design blank state
    [] Add blank state for Valuestream
    [] Create Valuestream (Email/Password) <- default admin
    [] Admin account (Full permissions)
    [] Member account (Limited Eediting permissions)
    [] Visitor account (Read-only permissions)
    [] Generate URL for Valuestream

[] Simplified Roadmap (condensed)
    [] Release plan-view

[] Add annotations (e.g. conflict/accepted) to epics (the Red/Green stars)
    [] Show Today's date on quarter

[] Side-pandel dependencies
    [] Update UI to single button for showing the Add Dependency Dialog
    [] Closing the Side-Pandel should Undim and unhighlight all epics

[] Improve adding dependencies between epics
    [] Filter by team
    [] Show only epics for the current team or all teams

[] FIX: Scrollbars
[] FIX: Deleting epics doesn't change the height of the epicsController.

[] Mouse-over epic shows full-details (useful for when epic's name is truncated)

========
 OPPORTUNITIES
========

[] Add Team Name to lower-left of Epics swim-lanes

[] Read Team Epics from JIRA

[] Write Team Epic changes to JIRA

[] Sync change with JIRA

[] Clicking on Team Name allows user to
    [] View Epic sequenced in order
    [] Change epci sequence order
    [] Remove Team
    [] Change Team name

[] Edit team name by clicking on the Team Name directly

[] Side-Panels
    [] Collapse Team side-panel
    [] Add Sticky Team name

[] Projected End Date field
    [] Sync-epic size to align with week boundary

[] Dragging epics
    [] Move epics to new week
    [] Extend epics End date by dragging end

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

[] Add a Kanban board to track the progress of conflicts

[] Dashboard progress tracking and reporting
    [] Team-level
    [] Valuestream-level
    [] Project-level that spans multiple valuestreams
    [] Business Area-level (that spans multiple projects/valuestreams)

[] Smart/live notes for documenting decisions and various specification gathering/documentation
========
 DONE
========

--

[X] Dependency conflicts
    [X] Use multiple rows when epics over-lap
    [X] Highlight conflicts between upstream epics that end after downstream epics start

[X] FIX: Epic position error. The week dividers aren't correctly included in the epic.x calculation

[X] Esc Key
    [X] Undims all epics
    [X] Closes side-panel

--

[X] Create new Team via CreateTeam button
    [X] Wire controls and logic to create new team
    [X] New team is saved to the server
    [X] New team appears on screen after button clicked
    [X] Epics can be added to new team

[X] (Client-side) Update Epic details via the Side-panel
    [X] Change Epic size using a drop-down
    [X] Show spill-over for epics that are outside of the quarter
    [X] Change RequestUpdateEpic to allow saving Epic Details back to the server
    [X] Change Epic Start date

[X] Add ability to delete data from site
    [X] Delete Epic
    [X] Delete Team
    [X] Refresh UI with updated Team Info

[X] BUG: Make sure dependency paths do not respond to the mouse clicks
[X] BUG: Remove selected epic from Dependency Dialog

[X] BUG: Dependencies don't show up in Side-panel until after refresh

-- Migrate client-site in-memory data to server-side in-memory

[X] Update name data on server
    [X] Update Team Name
    [X] Update Epic Name

[X] Save data to persistent store (MongoDB)
    [X] Create Team
    [X] Create Epic
    [X] Get all Teams
    [X] Get all Epics
    [X] Find EpicByID
    [X] Add Upstream Dependency
    [X] Remove Upstream Dependency
    [X] Add Downstream Dependency
    [X] Remove Downstream Dependency
    [X] Add ability to save updated data to the server
        [X] Update Epic Downstream Dependency
        [X] Update Epic Upstream Dependency

[X] Create data on the server
    [X] TeamEpic
    [X] Upstream Dependency
    [X] Downstream Dependency
    [X] Delete Upstream Dependency
    [X] Delete Downstream Dependency
    [X] Update client UI without refreshing the page

[X] Load site with data from server
    [X] Create the core structs
        []X Team
        [X] TeamEpic
        [X] Epic
    [X] Retrieve and load site from Routes

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


