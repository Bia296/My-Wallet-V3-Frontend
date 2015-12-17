angular
  .module('activity', [])
  .factory('Activity', Activity);

Activity.$inject = ['$rootScope', 'Wallet'];

function Activity($rootScope, Wallet) {
  const txList = Wallet.my.wallet.txList;

  const activity = {
    activities: [],
    transactions: [],
    logs: [],
    limit: 8,
    updateTxActivities: updateTxActivities,
    updateLogActivities: updateLogActivities,
    updateAllActivities: updateAllActivities
  };

  $rootScope.$on('updateActivityFeed', activity.updateAllActivities);
  txList.subscribe(updateTxActivities);
  return activity;

  function updateAllActivities() {
    activity.updateTxActivities();
    activity.updateLogActivities();
  }

  function updateTxActivities() {
    activity.transactions = txList.transactions()
      .slice(0, activity.limit)
      .map(factory.bind(null, 0));
    combineAll();
  }

  function updateLogActivities() {
    if (Wallet.settings.loggingLevel > 0) {
      Wallet.getActivityLogs(logs => {
        activity.logs = logs.results
          .slice(0, activity.limit)
          .map(factory.bind(null, 4));
        combineAll();
      });
    } else {
      activity.logs = [];
      combineAll();
    }
  }

  function combineAll() {
    activity.activities = activity.transactions
      .concat(activity.logs)
      .filter(hasTime)
      .sort(timeSort)
      .slice(0, activity.limit);
    $rootScope.$safeApply();
  }

  function factory(type, obj) {
    let a = { type: type };
    switch (type) {
      case 0:
        a.title = 'TRANSACTION';
        a.icon = 'ti-layout-list-post';
        a.time = obj.time * 1000;
        a.message = obj.txType.toUpperCase();
        a.result = Math.abs(obj.result);
        break;
      case 4:
        a.title = 'LOG';
        a.icon = 'ti-settings';
        a.time = obj.time;
        a.message = capitalize(obj.action);
    }
    return a;
  }

  function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  function timeSort(x, y) {
    return y.time - x.time;
  }

  function hasTime(x) {
    return (x.time != null) && x.time > 0;
  }
}
