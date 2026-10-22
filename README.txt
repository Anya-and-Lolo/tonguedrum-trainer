ETHEREAL DRUM TRAINER
=====================

WHAT IS THIS APP?

Ethereal Drum Trainer helps you learn songs on a steel tongue drum. You can
watch notes fly towards the drum, listen to songs, practise at different
speeds, use Wait for note and Tuner modes, build numbered songs, and view them
as a Jianpu music sheet.

Practice tools also include A-B section looping, end-of-song session results with
missed-note practice, and Focus Mode for mobile and tablet screens.

The sidebar shows all songs in demo-songs, followed by My songs. Approved Community
songs live in the green Community songs gallery with difficulty filters and album-style
covers. My Drum gives you a visual overview of the configured instrument, including note
numbers, pitches, colors and the optional companion drum.


HOW TO START A DOWNLOADED COPY

Windows
1. Extract the complete ZIP folder first.
2. Double-click START_TRAINER_Win.bat.
3. Keep the small trainer window open while using the app.

Windows does not need Python. The BAT launcher uses Windows PowerShell and
shows an error message if anything prevents the app from starting.

macOS
1. Install Python 3 if it is not already installed.
2. Extract the complete ZIP folder.
3. Double-click START_macOS.command.

If macOS blocks it, open Terminal in this folder and run:
chmod +x "START_macOS.command"
./"START_macOS.command"

Linux
1. Install Python 3 with your system package manager.
2. Extract the complete ZIP folder.
3. Run: sh "START_Linux.sh"

The shared macOS and Linux engine is stored in app-files. Windows users should
open START_TRAINER_Win.bat.


WHAT THE STARTER DOES

- Scans the demo-songs and community-songs folders.
- Rebuilds both public song catalogues.
- Watches for added, changed, renamed, or deleted .drumsong files.
- Opens the trainer in your browser.

If either catalogue changes while the starter is open, the browser applies the new
Demo/Community catalogue automatically. Opening Community songs also forces a fresh
catalogue check.


THE THREE SONG COLLECTIONS

Demo songs
These are selected and maintained by the app owner. Only approved files placed
in demo-songs become global demos. Song Builder always saves into the private
Song library and does not include a folder selector. To publish an owner-curated
demo, export its .drumsong file, place it in demo-songs, then start the trainer
locally to rebuild the catalogue or commit it so the online workflow rebuilds it.

Community gallery
These are separately reviewed community submissions. Anyone can browse and
play approved songs without an account. Visitors cannot directly edit this
public collection. Only files approved and placed in community-songs by the
owner appear in it.

My songs
Songs created with Song Builder remain private to that browser and device
unless you deliberately prepare and send them for Community gallery review.
Imported .drumsong files are private too. They are not automatically uploaded
to the owner or shared with other visitors.

Song library uses browser local storage, not cookies. Songs normally remain
after closing the browser, but clearing site data or changing devices can remove
them. It's a good idea to export important songs as backups on cloud or local
drive.

Private browsing or changing browsers can also create a separate private
library. Exported song backups use the .drumsong format. My Drum also lets you
export a .drumsettings backup of your instrument mapping and import it again
later.

Cloud syncing is intentionally not automatic. A safe cross-device cloud library
would require accounts, authentication, and a protected database so visitors
cannot read or overwrite one another's songs. The current private browser
library plus portable .drumsong backups keeps the public app account-free.


SUBMITTING TO THE COMMUNITY GALLERY

The Community gallery requires no account to browse or play.

To submit:
1. Create a song in Song library.
2. Open Community songs, then choose Submission info.
3. Select Submit selected song and wait for the progress bar to reach 100%.
4. The button changes to Song under review. That exact song version cannot be
   submitted again from the same browser; editing the title, notes, BPM, or
   scale makes the revised version eligible for submission.
5. The song is saved in the owner's private Google Drive review folder.
6. The owner reviews it and places approved files in community-songs. A local
   starter rebuilds the catalogue automatically; on GitHub Pages, commit the file
   and the included song-catalog workflow rebuilds and republishes the catalogue.

This submission method does not require an app account. Submissions never
enter the public gallery automatically.


JIANPU TIMING

- Regular is a quarter note and has no underline.
- Quick is an eighth note and has one underline below.
- Very quick is a sixteenth note and has two underlines below.
- A half note lasts two beats and uses one extension dash to the right.
- A whole note lasts four beats and uses three extension dashes to the right.
- Longer rests repeat 0 instead of using extension dashes.

The words Long and Hold are not Jianpu notation terms and are no longer used
for the timing controls.


LISTEN, PRACTICE AND THE SONG TAPE

Listen (it used to be called Demo) plays the song so you can sit back and
enjoy it. Practice scores your timing, Wait for note waits for every note, and
Tuner sits on its own to the right of the play modes.

In Drum centre the notes also scroll along the bottom of the stage: a little of
what you just played on the left and what comes next on the right, chords
stacked. In Practice and Wait for note each note turns teal (Perfect / Nice),
violet (Good) or red (Miss), and the same word pops up big at the top of the
stage. In Focus Mode the song name sits under the tape.

The All / Easy / Medium / Hard chips under Search songs filter the song list.


HELP AND WALKTHROUGHS

The main walkthrough introduces the animated song, Demo songs, My songs,
Community songs, Song Builder, and Help.

Practice, Wait for note, and Tuner each have their own three-step walkthrough.
The Don't show again box always starts empty. Completing a walkthrough does not
hide it permanently. Select Don't show again or click Skip to stop that
walkthrough from opening automatically.
Click ? while inside one of those modes to replay that mode's walkthrough at
any time. Click ? in Listen to replay the main walkthrough.


OPTIONAL PERFORMANCE CHECK

Add ?perf=1 to the end of the app address to show a small performance panel.
For example:
  index.html?perf=1

The panel shows frames per second, average drawing time, visible notes, current
particle quality, canvas resolution, and the number of prepared sounds. Remove
?perf=1 from the address to hide it. This panel is intended for testing and is
not shown during normal use.


GOOGLE DRIVE COMMUNITY SUBMISSIONS

The direct submission connection is configured. The ready-to-paste owner
script is retained here for maintenance:
app-files/owner-tools/GOOGLE_DRIVE_UPLOAD_SCRIPT.gs

The deployment URL becomes public when it is connected to a public website, so
the script does not treat the URL as a password. It accepts only small,
validated Ethereal Drum song documents and saves them in the dedicated review
folder.

After changing the Google Apps Script, saving the editor is not enough. Open
Deploy, select Manage deployments, edit the existing web app, choose New
version, and deploy it. This keeps the same /exec address while publishing the
new receiver code. The app uses both the immediate Google response and a
separate status check, so a successful upload can reliably reach 100%. The
receiver also guards against rapid duplicate uploads of the exact same song
version, while the app displays Song under review after a successful submit.


ONLINE / GITHUB PAGES VERSION

Online visitors do not use any starter file. The website loads owner-approved
Demo songs and Community gallery songs while keeping each visitor's My songs
collection private in their own browser.

Keep GitHub Pages configured permanently as:
  Settings > Pages > Source: Deploy from a branch
  Branch: main
  Folder: /(root)

Do NOT switch Pages Source to GitHub Actions.

This package includes:
- scripts/build-song-catalog.py
- .github/workflows/song-catalog.yml

When you add, remove, replace, or move a .drumsong file inside demo-songs or
community-songs and commit it to the default branch, the workflow will:
1. regenerate app-files/demo-catalog.js
2. commit that generated catalog to the default branch
3. explicitly request a GitHub Pages rebuild from the latest branch revision

The explicit rebuild is important because GitHub does not automatically run a
branch-based Pages build for commits created with a workflow GITHUB_TOKEN.

If the workflow reports that it cannot push, check:
  Settings > Actions > General > Workflow permissions
and allow Read and write permissions, unless a repository/organization policy
prevents it.

The online service worker is network-first for app files and the public song
catalogue. The open app also checks the catalogue with a cache-busting URL, so
newly deployed Demo/Community songs can appear in an already-open tab without
asking visitors to clear cookies or site data. App-code updates activate the new
service worker immediately and refresh an existing controlled page once.
