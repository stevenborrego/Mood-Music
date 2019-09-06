Yves Wienecke<Br/>
Steven Borrego

http://cs465-mood-music.appspot.com

# CS465 Final Project - Mood Music

Synthesia is a peculiar medical condition that combines senses together.

A person may:
* Hear a sound and see a color
* Smell something and hear a sound
* See a word and taste a flavor

This project is meant to be a representation of what Synthesia might look like to those who have it.

1. Enter a song or playlist
2. We calculate a color for each song 
3. Visualize your data!

This project uses an express backend, bootstrap frontend, and the Spotify api.

<hr/>

## [Notes for git](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow):

![Visualization of git branch management.](https://wac-cdn.atlassian.com/dam/jcr:b5259cce-6245-49f2-b89b-9871f9ee3fa4/03%20(2).svg?cdnVersion=lb).

```
// Create a development branch for ongoing features
git branch develop
git push -u origin develop
```

```
// Track changes from an existing branch (after develop branch is created)
git checkout --track origin/develop
```

```
// Delete a branch
git branch -d branch_to_delete
```

```
// Change current branch to 'develop' and create a branch for a new feature
git checkout develop
git checkout -b feature_branch
```

```
// When done with a feature branch
git checkout develop
git merge feature_branch
```


# API references

* [Spotify Official API](https://developer.spotify.com/documentation/web-api/reference/search/search/)
* [Spotify Web authentication API Example/Guide](https://github.com/spotify/web-api-auth-examples/blob/master/client_credentials/app.js)
* [Spotify module aka the easy way out](https://github.com/thelinmichael/spotify-web-api-node)
* [Promise pending (for waiting to get a response from API before doing stuff)](https://stackoverflow.com/questions/38884522/promise-pending)
