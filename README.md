# :bookmark: baton

> Easily share, capture and tag links in Slack

---

`/baton pass "Concurrency is not parallelism" https://talks.golang.org/2012/waza.slide#1 ["golang", "code", "concurrency", "cs"]`

## Rationale

When we have to wrangle links that enable us to do our jobs better, it's common to:

* Unintentionally hoard the information in a local bookmark repo (Ctrl + D)
* Place the links in Wikis that aren't version controlled and have limited functionality (which in a few ways is good)
* Rely on crufty search history and hope that those useful links will just be there forever and easy to find
* Combine one or more of the above approaches, making the problem even worse

The goal of baton is to make it easier for teams to share and manage links that help accelerate productivity

## Setup

baton currently has a public instance deployed at http://baton.apps.madhax.io

Team registration can be performed via a `POST` to `http://baton.apps.madhax.io/v1/teams`:

`$ curl -H "Content-Type: application/json" -X POST -d '{"token": "YOUR_SLACK_TOKEN", "team_id": "T04L487UB", "team_domain": "madhax", "service_id": "10842527789"}' http://baton.apps.madhax.io/v1/teams?slack`

and yes, I will eventually get to a registration page :see_no_evil:

---

If you would like to set up your own instance of baton, I recommend using [DigitalOcean](http://digitalocean.com) and the [RethinkDB Plugin for Dokku](https://github.com/stuartpb/dokku-rethinkdb-plugin).

A guide on setting up a Dokku image with RethinkDB can be found here:  https://rethinkdb.com/blog/dokku-deployment/

## Command

The most straight foward way to create a baton is via command:

Pass (create) a baton:

`/baton pass "Guide to $scope" https://github.com/angular/angular.js/wiki/Understanding-Scopes ["angular", "js", "scope", "framework"]`

Discover other batons (by tag) passed by your team:

`/baton find ["js"]`

Drop (delete) a baton:

`/baton drop "Guide to $scope"`

## Hooks

baton also supports Slack's Outgoing Webhook API, allowing it to react to trigger words mentioned in your channel.
This allows you to communicate resources with your team while having them implicitly captured in the background:

_"pass hey @bob check out this feature list I found for ['js', 'es6']: https://github.com/lukehoban/es6features"_

The above message, when made in a public Slack channel, is synonymous with the following command:

`/baton pass https://github.com/lukehoban/es6features ['js', 'es6']`

> **Note**
> A current limitation with hooks is not being able to provide a label for the baton

## TODO

- [ ] Prevent bad links (4XX) from being passed
- [ ] Incoming notifications for new batons
- [ ] Allow users to browse batons by label/tag with a regex pattern
- [ ] Allow users to browse related resources across all registered teams (`find` global flag)
