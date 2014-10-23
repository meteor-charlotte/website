Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      return this.subscribe("meetups");
    },
    data: {
      upcomingMeetup: Meetups.find({dateTime : {$gt : new Date()} }, {sort: {dateTime: 1}, limit: 1}),
      groupName : Meteor.settings.public.meetup.group_name,
      groupInfo : Meteor.settings.public.meetup.group_info,
      sponsors : Meteor.settings.public.sponsors
    },
    onAfterAction: function() {
      GAnalytics.pageview('/');
    }
  });

  this.route('meetups', {
    path: '/meetups',
    waitOn: function() {
      return this.subscribe("meetups");
    },
    data: {
      upcomingMeetup: Meetups.find({dateTime : {$gt : new Date()} }, {sort: {dateTime: 1}, limit: 1}),
      previousMeetups: Meetups.find({dateTime : {$lt : new Date()} }, {sort: {dateTime: -1}})
    },
    onAfterAction: function() {
      GAnalytics.pageview('/meetups');
      SEO.set({
        title: 'Meetups | ' + SEO.settings.title
      });
    }
  });
  this.route('meetupDetail', {
    path: '/meetups/:_id',
    waitOn: function() {
      return [
        this.subscribe("meetup", this.params._id),
        this.subscribe("suggestedTopics"),
        this.subscribe("members")
      ];
    },
    data: function() {
      return {
        meetup: Meetups.findOne({_id: this.params._id}),
        suggestedTopics: Topics.find({presented: {$ne: true}}, {sort: {points: -1}}),
        members: Meteor.users.find({}, {sort: {'profile.points': -1}})
      };
    },
    onAfterAction: function() {
      if(this.ready()) {
        GAnalytics.pageview('/meetups/' + this.params._id);
        SEO.set({
          title: this.data().meetup.title + ' | Meetups | ' + SEO.settings.title
        });
      }
    }
  });

  this.route('topics', {
    path: '/topics',
    waitOn: function() {
      return [
        this.subscribe("suggestedTopics"),
        this.subscribe("presentedTopics")
      ];
    },
    data: {
      suggestedTopics: Topics.find({presented: {$ne: true}}, {sort: {points: -1}}),
      presentedTopics: Topics.find({presented: true}, {sort: {points: -1}})
    },
    onBeforeAction: function() {
      if (!this.params.tab) {
        this.params.tab = 'suggested';
      }
    },
    onAfterAction: function() {
      GAnalytics.pageview('/topics');
      SEO.set({
        title: 'Topics | ' + SEO.settings.title
      });
    }
  });
  this.route('topicDetail', {
    path: '/topics/:_id',
    waitOn: function() {
      return this.subscribe("topic", this.params._id);
    },
    data: function() {
      return {
        topic: Topics.findOne({_id: this.params._id}),
        comments: Comments.find({parentType: 'topic', parentId: this.params._id}, {sort: { createdAt: -1 }})
      };
    },
    onAfterAction: function() {
      if(this.ready()) {
        GAnalytics.pageview('/topics/' + this.params._id);
        SEO.set({
          title: this.data().topic.title + ' | Topics | ' + SEO.settings.title
        });
      }
    }
  });

  this.route('presentations', {
    path: '/presentations',
    waitOn: function() {
      return [this.subscribe("presentations"), this.subscribe("members")];
    },
    data: {
      topics: Presentations.find({})
    },
    onAfterAction: function() {
      GAnalytics.pageview('/presentations');
      SEO.set({
        title: 'Presentations | ' + SEO.settings.title
      });
    }
  });
  this.route('presentationDetail', {
    path: '/presentations/:_id',
    waitOn: function() {
      return this.subscribe("presentation", this.params._id);
    },
    data: function() {
      return {
        presentation: Presentations.findOne({_id: this.params._id}),
        comments: Comments.find({parentType: 'presentation', parentId: this.params._id}, {sort: { createdAt: -1 }})
      };
    },
    onAfterAction: function() {
      if (this.ready()) {
        GAnalytics.pageview('/presentations/' + this.params._id);
        SEO.set({
          title: this.data().presentation.name + ' | Presentations | ' + SEO.settings.title
        });
      }
    }
  });

  this.route('members', {
    path: '/members',
    waitOn: function() {
      return this.subscribe("members");
    },
    data: {
      members: Meteor.users.find({}, {sort: {'profile.points': -1}})
    },
    onAfterAction: function() {
      GAnalytics.pageview('/members');
      SEO.set({
        title: 'Members | ' + SEO.settings.title
      });
    }
  });
  this.route('memberDetail', {
    path: '/members/:_id',
    waitOn: function() {
      return this.subscribe("member", this.params._id);
    },
    data: function() {
      return {
        member: Meteor.users.findOne({_id: this.params._id})
      };
    },
    onAfterAction: function() {
      if(this.ready()) {
        GAnalytics.pageview('/members/' + this.params._id);
        SEO.set({
          title: this.data().member.profile.name + ' | Members | ' + SEO.settings.title
        });
      }
    }
  });

  this.route('meteorday', {
    path: '/meteorday',
    where: 'server',
    action: function() {
      GAnalytics.pageview('/meteorday');
      this.response.writeHead(301, {Location: 'http://www.meetup.com/Meteor-Charlotte/events/211968732/'});
      this.response.end();
    }
  });

  this.route('notFound', {
    path: '*',
    where: 'server',
    action: function() {
      this.response.statusCode = 404;
      this.response.end(Handlebars.templates['404']());
    }
  });
});
