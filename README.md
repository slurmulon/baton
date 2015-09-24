# :bookmark: baton

> Easily share, capture and tag links with your team in Slack

---

`/baton pass https://talks.golang.org/2012/waza.slide#1 ["golang", "concurrency", "parallelism"]`

## Rationale

When we have to wrangle all the links that enable us to do our jobs better, it's common to:

* Unintentionally hoard the information in a local bookmark repo (Ctrl + D)
* Place the links in Wikis that aren't version controlled (which in a few ways is good) and have limited functionality
* Rely on crufty search history and hope that those useful links will just be there forever and easy to find
* Combine one or more of the above approaches, making the problem even worse

The goal of baton is to make it easier for teams to share and manage links that help accelerate productivity

## :wrench: Setup

### Hosted

baton currently has a public instance deployed at http://baton.apps.madhax.io

Team registration can be performed via a `POST` to `http://baton.apps.madhax.io/v1/teams`:

`$ curl -H "Content-Type: application/json" -X POST -d '{"token": "YOUR_SLACK_TOKEN", "team_id": "YOUR_TEAM_ID", "team_domain": "YOUR_TEAM_SUB_DOMAIN"}' http://baton.apps.madhax.io/v1/teams`

and yes, I will eventually get to a registration page :see_no_evil:

---

### Custom

If you would like to set up your own instance of baton, I recommend using [DigitalOcean](http://digitalocean.com) and the [RethinkDB Plugin for Dokku](https://github.com/stuartpb/dokku-rethinkdb-plugin).

A guide on setting up a Dokku image with RethinkDB can be found here:  https://rethinkdb.com/blog/dokku-deployment/

---

Regardless of your setup method, you must also create and configure at least one of the following slack integrations:

* Outgoing WebHook: https://slack.com/services/new/outgoing-webhook
  - `URL` -> `http://baton.apps.madhax.io/v1/batons?slack`
* Command: https://madhax.slack.com/services/new/slash-commands
  - `pass` -> `POST http://baton.apps.madhax.io/v1/batons?slack`
  - `drop` -> `DELETE http://baton.apps.madhax.io/v1/batons?slack`
  - `find` -> `GET http://baton.apps.madhax.io/v1/batons?slack`

If deploying your own baton instance, be sure to replace the above URLs with your own.

(The `?slack` query param tells baton to explicitly parse incoming requests as slack text/commands. Needs improvement to say the least.)

## :guardsman: Command

The most straight foward way to create a baton is via command:

Pass (create) a baton:

`/baton pass https://github.com/angular/angular.js/wiki/Understanding-Scopes ["angular", "js", "scope", "framework"]`

Discover other batons (by tag) passed by your team:

`/baton find js`

Drop (delete) a baton:

`/baton drop "Guide to $scope"`

## :sound: Hooks

baton also supports Slack's Outgoing Webhook API, allowing it to react to trigger words mentioned in your channel.
This allows you to communicate resources with your team while having them implicitly captured in the background:

_"pass hey @bob check out this feature list I found for ['js', 'es6']: https://github.com/lukehoban/es6features"_

The above message, when made in a public Slack channel, is synonymous with the following command:

`/baton pass https://github.com/lukehoban/es6features ['js', 'es6']`

## :telescope: TODO

- [ ] Prevent bad links (4XX) from being passed
- [ ] Parse labels from slack text messages (labels temporarily disabled for now for consistency)
- [ ] Incoming hook notifications for new batons
- [ ] Allow users to browse batons by more than one tag
- [ ] Allow users to browse batons by label/tag with a regex pattern
- [ ] Allow users to browse related resources across all registered teams (`find` global flag)
