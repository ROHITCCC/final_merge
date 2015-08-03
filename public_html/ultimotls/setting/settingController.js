/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var settingModule = angular.module('settingModule', []);

settingModule.filter('pagination', function () {
    return function (input, start)
    {
        if (!input || !input.length) {
            return;
        }
        start = parseInt(start, 10);
        return input.slice(start);
    };
});
settingModule.directive('uppercased', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (input) {
                return input ? input.toUpperCase() : "";
            });
            element.css("text-transform", "uppercase");
        }
    };
});

settingModule.directive('lowercased', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (input) {
                return input ? input.toUpperCase() : "";
            });
            element.css("text-transform", "lowercase");
        }
    };
});

settingModule.directive('confirmationNeeded', function () {
    return {
        priority: 1,
        terminal: true,
        link: function (scope, element, attr) {
            var msg = attr.confirmationNeeded || "Are you sure?";
            var clickAction = attr.ngClick;
            element.bind('click', function () {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction);
                }
            });
        }
    };
});


settingModule.controller('SettingsController', ['$scope', '$http', 'localStorageService', 'resetTimerService', function ($scope, $http, localStorageService, resetTimerService) {
        var settingURL = TLS_PROTOCOL + "://" + TLS_SERVER + ":" + TLS_PORT + "/_logic/SettingService";
        var schedulerURL = TLS_PROTOCOL + "://" + TLS_SERVER + ":" + TLS_PORT + "/_logic/SchedulerService";
        $scope.settings = {};
        $scope.schedulerstatus = 0;
        $scope.reports = {};
        $scope.errormsg = '';
        $scope.temprep = {};
        $scope.curPage = 0;
        $scope.pageSize = 50;
        $scope.curPageImmi = 0;
        $scope.units = ['sec', 'min', 'hrs', 'day'];
        $scope.numbers = ['3', '5', '10', '15', '20', '30', '40', '50', '100', '200'];
        $scope.selectedNumber = $scope.numbers[7];
        $scope.selectedNumberAggri = $scope.numbers[4];
        $scope.curPageAggri = 0;
        $scope.pageSizeAggri = 4;
        $scope.immidatejob = {"requestType": "", "jobName": "ImmidateNotificationRefreshJob", "jobClass": "ImmidateNotificationRefreshJob", "frequency": {"duration": "", "unit": "", "starttime": ""}};
//////////////////////////////////////SETTINGS//////////////////////////////////////////
        $scope.settingPromise = function () {
            var promise = $http.get(settingURL + "?object=setting").success(function (data, status, header, config) {
                var auth_token_valid_until = header()['auth-token-valid-until'];
                resetTimerService.set(auth_token_valid_until);
            });
            return promise;
        };
        $scope.settingPromise().then(function (data) {
            $scope.settings = data.data._embedded['rh:doc'][0];
            if ($scope.settings.setting.envsetup === undefined) {
                $scope.settings.setting.envsetup = [{name: '', description: '', label: ''}];
                $scope.environments = $scope.settings.setting.envsetup;
            } else {
                $scope.environments = $scope.settings.setting.envsetup;
            }
            ;
            if ($scope.settings.setting.notification === undefined) {
                $scope.settings.setting.notification = {immidate: {frequency: {duration: '', unit: ''}, notification: [{severity: '', email: '', application: {name: '', interfaces: ['']}}]}};
                $scope.notifications = $scope.settings.setting.notification;
            } else {
                $scope.notifications = $scope.settings.setting.notification;
            }

        });
        $scope.settingPromise().catch(function () {
            $scope.newsettingcreator = 1;
            newsetting = {setting: {apisetup: {hostname: '', port: '', database: '', collections: {payload: '', audits: ''}}, notification: {immidate: {frequency: {duration: '1', unit: 'hrs'}, jobRefreshRate: {duration: '1', unit: 'hrs'}, notification: [{envid: '', severity: '', email: '', application: {name: '', interfaces: ['']}}]}}, envsetup: [{name: '', description: '', label: ''}]}};
            $scope.settings = newsetting;
            $scope.environments = $scope.settings.setting.envsetup;
            $scope.notifications = $scope.settings.setting.notification;
        });
        $scope.settingPromise().finally(function () {

////Immidate tools
            $scope.addNewImmidate = function () {
                newson = {envid: '', severity: '', email: '', template: '', application: {name: '', interfaces: ['']}};
                $scope.notifications.immidate.notification.push(newson);
            };
            $scope.addImmidateInterface = function (upindex) {
                if ($scope.curPageImmi >= 1) {
                    temp = ($scope.curPageImmi * $scope.pageSizeImmi) + upindex;
                    $scope.notifications.immidate.notification[temp].application.interfaces.push({});
                } else {
                    $scope.notifications.immidate.notification[upindex].application.interfaces.push('');
                }
            };
            $scope.removeImmidateInterface = function (upindex, index) {
                if ($scope.curPageImmi >= 1) {
                    temp = ($scope.curPageImmi * $scope.pageSizeImmi) + upindex;
                    $scope.notifications.immidate.notification[temp].application.interfaces.splice(index, 1);
                } else {
                    $scope.notifications.immidate.notification[upindex].application.interfaces.splice(index, 1);
                }
            };
            $scope.removeImmidate = function (index) {
                $scope.notifications.immidate.notification.splice(index, 1);
            };
            //Environment tools
            $scope.addNewEnv = function () {
                newson = {name: '', description: '', label: ''};
                $scope.environments.push(newson);
            };
            $scope.removeEnv = function (index) {
                $scope.environments.splice(index, 1);
            };
            $scope.numberOfPagesEnv = function () {
                return Math.ceil($scope.environments.length / $scope.pageSize);
            };
            $scope.savesetting = function (reloadFlag) {
                $scope.temp = $scope.settings;
                $scope.savedata($scope.temp);
                $scope.reloadPage = reloadFlag;
            };
            $scope.numberOfPagesImmi = function () {
                $scope.pageSizeImmi = $scope.selectedNumber;
                return Math.ceil($scope.notifications.immidate.notification.length / $scope.pageSizeImmi);
            };
            $scope.inmidateStartjob = function () {
                console.log($scope.notifications);
                $scope.immidatejob.requestType = 'startJob';
                $scope.immidatejob.frequency.duration = $scope.notifications.immidate.jobRefreshRate.duration;
                $scope.immidatejob.frequency.unit = $scope.notifications.immidate.jobRefreshRate.unit;
                console.log($scope.immidatejob);
                $scope.scheduler($scope.immidatejob);
            };
            $scope.inmidateStopjob = function () {
                temporal = $scope.immidatejob;
                $scope.immidatejob.requestType = 'stopJob';
                delete temporal.frequency;
                console.log($scope.immidatejob);
                $scope.scheduler(temporal);
            };
            //Env dropdown
            $scope.envDropdown = angular.copy($scope.environments);
            $scope.$watch('envDropdown', function () {
                localStorageService.cookie.add('envOptions', $scope.envDropdown);
            });
            $scope.reload = function () {
                location.reload();
            };
        });
//////////////////////////////////////REPORT////////////////////////////////////////////    
        $scope.reportPromise = function () {
            var reportpromise = $http.get(settingURL + "?object=report").success(function (data, status, header, config) {
                var auth_token_valid_until = header()['auth-token-valid-until'];
                resetTimerService.set(auth_token_valid_until);
            });
            return reportpromise;
        };
        $scope.reportPromise().then(function (data) {
            $scope.reports = data.data._embedded['rh:doc'];
        });
        $scope.reportPromise().catch(function () {
            $scope.newreport = 1;
            $scope.reports = [{report: {envid: '', application: '', interface1: '', errorType: '', frequency: {starttime: '', duration: '', unit: ''}, email: '', template: ''}}];
        });
        $scope.reportPromise().finally(function () {
            $scope.addNewAggrigated = function () {
                newson = {report: {envid: null, application: null, email: null, interface1: null, errorType: null, frequency: {duration: null, starttime: null, unit: null}}};
                $scope.reports.push(newson);
            };
            $scope.removeAggrigated = function (index) {
                if ($scope.curPageAggri >= 1) {
                    temp = ($scope.curPageAggri * $scope.pageSizeAggri) + index;
                    $scope.delrowreport(temp);
                } else {
                    $scope.delrowreport(index);
                }
            };
            $scope.numberOfPagesAggri = function () {
                $scope.pageSizeAggri = $scope.selectedNumberAggri;
                return Math.ceil($scope.reports.length / $scope.pageSizeAggri);
            };
            $scope.validatereport = function (object, index) {
                if (object.envid === undefined || object.application === '' ||
                        object.application === undefined || object.application === '' ||
                        object.frequency.duration === undefined || object.frequency.duration === '' ||
                        object.frequency.unit === undefined || object.frequency.unit === '' ||
                        object.email === undefined || object.email === '') {
                    $('#validaterror').modal();
                } else {
                    if (object.frequency.starttime) {
                        object.frequency.starttime = object.frequency.starttime.replace(/ /g, "T");
                    }
                    $scope.temprep.report = object;
                    if ($scope.reports[index]._id !== undefined) {
                        $scope.temprep._id = {$oid: $scope.reports[index]._id.$oid};
                    }
                    $scope.savedata($scope.temprep, index);
                }
            };
            $scope.saveAggrigated = function (index) {
                if ($scope.curPageAggri >= 1) {
                    temp = ($scope.curPageAggri * $scope.pageSizeAggri) + index;
                    $scope.validatereport($scope.reports[temp].report, temp);
                } else {
                    $scope.validatereport($scope.reports[index].report, index);
                }
            };
            $scope.delrowreport = function (index) {
                if ($scope.reports[index]._id !== undefined) {
                    $scope.temprep._id = {$oid: $scope.reports[index]._id.$oid};
                    $scope.temprep.report = $scope.reports[index].report;
                    $scope.delinfo($scope.temprep, index);
                } else {
                    $scope.reports.splice(index, 1);
                }
            };
        });

//////////////////////////////////////SCHEDULE INFO///////////////////////////////////// 
        $scope.schedulerJob = function () {
            var getjobs = {"requestType": "getAllJobs"};
            var schedulerjob = $http.post(schedulerURL, getjobs).success(function (data, status, header, config) {
                var auth_token_valid_until = header()['auth-token-valid-until'];
                resetTimerService.set(auth_token_valid_until);
                $scope.schedulers = data;
                console.log($scope.schedulers);
                $scope.starter = {};
                $scope.resumeJob = function (index) {
                    status = 'resume';
                    temporalkey = $scope.schedulers[index].jobKey;
                    $scope.starter = {"requestType": "resumeJob", "jobKey": $scope.schedulers[index].jobKey};
                    console.log($scope.starter);
                    $scope.scheduler($scope.starter, status);
                };
                $scope.pauseJob = function (index) {
                    status = 'suspend';
                    temporalkey = $scope.schedulers[index].jobKey;
                    $scope.starter = {"requestType": "suspendJob", "jobKey": $scope.schedulers[index].jobKey};
                    console.log($scope.starter);
                    $scope.scheduler($scope.starter, status);
                };
            });
            return schedulerjob;
        };

//////////////////////////////////////SCHEDULE STATUS //////////////////////////////////
        $scope.schedulerStatus = function () {
            var getstatus = {"requestType": "getSchedulerStatus"};
            var schedulerstatus = $http.post(schedulerURL, getstatus).success(function (data, status, header, config) {
                var auth_token_valid_until = header()['auth-token-valid-until'];
                resetTimerService.set(auth_token_valid_until);
            });
            return schedulerstatus;
        };
        
        $scope.schedulerStatus().then(function (data){
            $scope.SchedulerStatus = data.data;
            console.log($scope.SchedulerStatus);
        });


//////////////////////////////////////GLOBAL//////////////////////////////////////////// 

        $scope.batch = {requestType: '', jobName: "BatchReplayJob", jobClass: "BatchReplayJob", frequency: {starttime: '', duration: '', unit: ''}};
        $scope.schedulerObj = {requestType: '', propertiesFile: ''};
        $scope.savedata = function (insert, index) {
            var conAjax = $http.post(settingURL, insert);
            conAjax.success(function (response, status, header, config) {
                var auth_token_valid_until = header()['auth-token-valid-until'];
                resetTimerService.set(auth_token_valid_until);
                $scope.envDropdown = angular.copy($scope.environments);
                $('#savesuccess').modal();
                if (typeof index !== "undefined") {
                    $scope.reports[index]._id = {$oid: response};
                }
            });
            conAjax.error(function (response) {
                $scope.envDropdown = angular.copy($scope.environments);
                $('#savefail').modal();
            });
        };
        $scope.delinfo = function (insert, remove) {
            var conAjax = $http.delete(settingURL, {data: insert});
            ;
            conAjax.success(function (response) {
                $scope.reports.splice(remove, 1);
                $('#deletesuccess').modal();
            });
            conAjax.error(function (response) {
                $('#deletefail').modal();
            });
        };
        $scope.batchstart = function () {
            $scope.batch.requestType = "startJob";
            console.log($scope.schedulers);
            $scope.batch.frequency.duration = $scope.schedulers.frequency;
            if ($scope.batch.frequency.starttime) {
                $scope.batch.frequency.starttime = $scope.batch.frequency.starttime.replace(/ /g, "T");
            } else {
                $scope.batch.frequency.starttime = "";
            }
            $scope.scheduler($scope.batch, 1);
        };
        $scope.batchstop = function () {
            $scope.batch.requestType = "stopJob";
            delete $scope.batch.frequency;
            $scope.scheduler($scope.batch, 2);
        };
        $scope.scheduler = function (object, opt) {
            var conAjax = $http.post(schedulerURL, object);
            conAjax.success(function (response, status, header, config) {
                var auth_token_valid_until = header()['auth-token-valid-until'];
                resetTimerService.set(auth_token_valid_until);
                $scope.schedulerstatus = opt;
                if (opt == "2") {
                    $scope.batchScheduler.batchFrequency.$touched = false;
                    $scope.batchScheduler.batchFrequency.$invalid = false;
                    $scope.batchScheduler.batchUnit.$touched = false;
                    $scope.batchScheduler.batchUnit.$invalid = false;
                    $('.SchedulerJob').remove();
                }
                if (opt == 'resume' || opt == 'suspend') {
                    $scope.schedulerJob();
                }
                if (opt == "4"){
                    $scope.SchedulerStatus="stopped";
                    $('.SchedulerJob').remove();
                }
                if (opt == "3"){
                    $scope.SchedulerStatus="started";
                }
                console.log('none');
                console.log($scope.SchedulerStatus);
            });
            conAjax.error(function (response) {
                $scope.schedulerstatus = 0;
                $scope.errormsg = response.message;
                $('#schedulermodal').modal();
            });
        };
        $scope.startscheduler = function () {
            $scope.schedulerObj.requestType = "startScheduler";
            $scope.scheduler($scope.schedulerObj, 3);
        };
        $scope.stopscheduler = function () {
            $scope.schedulerObj.requestType = "stopScheduler";
            $scope.scheduler($scope.schedulerObj, 4);
        };
    }]);
