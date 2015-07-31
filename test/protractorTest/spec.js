// spec.js
describe('Ultimo TLS', function() {
  var loginName = element(by.model('cred.username'));
  var loginPass = element(by.model('cred.password'));
  var loginEnv = element(by.model('cred.envid'));
  var loginButton = element(by.id('loginBtn'));
  var dropdown = element(by.model('timeSelected'));
  var toggle = dropdown.element(by.id('currentTimeSelect'));
  var fromDate = element(by.model('calender.from'));
  var toDate = element(by.model('calender.to'));
  var calendarSub = element(by.id('customTimeSubmit'));
  var treemapSVG = element.all(by.id('treemapSVG'));
  var auditSearchBox = element(by.model('searchCriteria'));
  var auditSearchButton = element(by.id('auditSearchBtn'));
  var payloadButton = element(by.id('payloadBtn'));
  var replayButton = element(by.id('replayBtnPayload'));
  var restSubmitButton = element(by.id('replayRestBtn'));
  var restEndpoint = element(by.model('restReplay.endpointUrl'));
  var restHeaderType = element(by.model('restReplay.header.type'));
  var restHeaderVal = element(by.model('restReplay.header.value'));

  function login(name, pass, envid) {
	loginName.sendKeys(name);
	loginPass.sendKeys(pass);
	loginEnv.sendKeys(envid)
	loginButton.click();
  }
  function searchAudit(search){
	auditSearchBox.sendKeys(search);
	auditSearchButton.click();
  };
  function enterRestData(endpoint, content, headerType, headerVal, method){
	restEndpoint.sendKeys(endpoint);
	element(by.cssContainingText('option', 'application/json')).click();
	restHeaderType.sendKeys(headerType);
	restHeaderVal.sendKeys(headerVal);
	element(by.cssContainingText('option', 'POST')).click();
	restSubmitButton.click();
  }

  beforeEach(function() {
    browser.get('http://localhost:8383/UltimoTLS/index.html#/treemap');
  });

  it('should log in and do treemap commands', function() {
		login("a", "a", "PROD");
		toggle.click();
		element.all(by.repeater('time in timeOptions')).
			get(4).
			$('a').
			click();
		toggle.click();
		element.all(by.repeater('time in timeOptions')).
			get(5).$('a').click();
		browser.sleep(500);
		fromDate.sendKeys("07/15/2015");
		toDate.sendKeys("07/31/2015");
		calendarSub.click();
		browser.sleep(1000);
		treemapSVG.get(0).$('g').click();
		browser.sleep(1000);
		browser.actions().doubleClick(treemapSVG.get(0).$('g')).perform();
		browser.sleep(1000);
		
  });
  it('should search audits and do a rest replay', function() {
	  //login("a", "a", "PROD");
		element.all(by.repeater('tab in tabs')).
			get(1).$('a').click();
		searchAudit("ebs");
		element.all(by.repeater("d in data._embedded['rh:doc']| orderBy:predicate:reverse")).
			get(0).
			click();
		browser.sleep(500);
		payloadButton.click();
		browser.sleep(500);
		replayButton.click();
		browser.sleep(500);
		enterRestData("http://demo9083151.mockable.io/rest","application/json","Authorization","Basic YTph","POST");
		browser.sleep(5000);
  });
  
});