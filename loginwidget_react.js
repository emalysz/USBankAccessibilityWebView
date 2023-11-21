$(function loginLoading() {
  function detectBrowser() {
    var ua = navigator.userAgent;
    uaArr = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
   
    return { browserType: uaArr[1], browserVersion: uaArr[2]}
  }; 
  function browserUpdateInfo() {
    location.href = 'https://www.usbank.com/customer-service/knowledge-base/KB0070130.html';
  }
  function closeInfo() {
    const browserMessage = document.getElementById('safa-overlay');
    browserMessage.classList.remove('safa-visible');
    browserMessage.classList.add('safa-hidden');
  }
    function displayPopup(){

      var safaOverlay = document.createElement("div");
      safaOverlay.id = "safa-overlay";
      safaOverlay.className =  "safa-overlay safa-visible";

      var safaContent = document.createElement("div");
      safaContent.className =  "safa-content";

      var browserErrorTxt = document.createElement("div");
      browserErrorTxt.id = "browser_error_txt";
      browserErrorTxt.setAttribute("role","dialog");
      browserErrorTxt.setAttribute("aria-modal",true);
      browserErrorTxt.setAttribute("aria-labelledby","dialog1Title");
      browserErrorTxt.setAttribute("aria-describedby","dialog1Desc");

      var dialogTitle = document.createElement("h1");
      dialogTitle.id = "dialogTitle";
      dialogTitle.textContent = "It's time to update your browser.";

      var dialogDesc = document.createElement("p");
      dialogDesc.id = "dialogDesc";
      dialogDesc.className = "safa-body-text";
      dialogDesc.textContent = "It looks like you're using an older browser version. Please update it to log in.";

      var closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.id = "safaClose";
      closeButton.className = "safa-close";
      closeButton.setAttribute("tabindex","1");
      closeButton.setAttribute("aria-label","close modal");
      closeButton.addEventListener("click",closeInfo);

      var svgIcon = document.createElementNS("http://www.w3.org/2000/svg","svg");
      svgIcon.setAttribute("width","20");
      svgIcon.setAttribute("height","20");
      svgIcon.setAttribute("viewBox","0 0 20 20");
      svgIcon.setAttribute("fill","none");

      var svgPath = document.createElementNS("http://www.w3.org/2000/svg","path");
      svgPath.setAttribute("fill-rule","evenodd");
      svgPath.setAttribute("clip-rule","evenodd");
      svgPath.setAttribute("d","M19.22 10C19.22 13.744 16.963 17.1188 13.5029 18.5487C10.0427 19.9787 6.06175 19.1818 3.41864 16.5301C0.775535 13.8784 -0.0084331 9.89486 1.43275 6.43935C2.87393 2.98384 6.25601 0.737863 9.99999 0.750006C15.1063 0.755517 19.2445 4.89366 19.25 10H19.22ZM14 7.00001L11 10L14 13L13 14L9.99999 11L6.99999 14L5.99999 13L8.99999 10L5.99999 7.00001L6.99999 6.00001L9.99999 9.00001L13 6.00001L14 7.00001ZM12.9288 2.83711C15.8285 4.03489 17.72 6.8627 17.72 10H17.75C17.7445 14.2779 14.2779 17.7445 9.99999 17.75C6.86271 17.7621 4.02758 15.8816 2.81857 12.9866C1.60956 10.0917 2.26519 6.75333 4.4793 4.53062C6.6934 2.30791 10.0292 1.63934 12.9288 2.83711Z");
      svgPath.setAttribute("fill","#555555");
      
      svgIcon.appendChild(svgPath);
      closeButton.appendChild(svgIcon);
      safaContent.appendChild(closeButton);
      safaContent.appendChild(dialogTitle);
      safaContent.appendChild(dialogDesc);
      browserErrorTxt.appendChild(safaContent);

      var footerButtons = document.createElement("div");
      footerButtons.className = "safari-flex-inline safa-footer";

      var closeButtonFooter = document.createElement("button");
      closeButtonFooter.className = "safa-button safa-prime";
      closeButtonFooter.type = "button";
      closeButtonFooter.textContent = "Close";
      closeButtonFooter.setAttribute("tabindex","3");
      closeButtonFooter.addEventListener("click",closeInfo);

      var browserUpdateButton = document.createElement("button");
      browserUpdateButton.className = "safa-button safa-sec";
      browserUpdateButton.type = "button";
      browserUpdateButton.textContent = "Browser update info";
      browserUpdateButton.setAttribute("tabindex","2");
      browserUpdateButton.addEventListener("click",browserUpdateInfo);

      footerButtons.appendChild(closeButtonFooter);
      footerButtons.appendChild(browserUpdateButton);

      browserErrorTxt.appendChild(footerButtons);
      safaOverlay.appendChild(browserErrorTxt);
	  
      $('.login-buttons button.loginButton').removeClass("widgetLoading").removeAttr('aria-label');
      var firstElement = document.body.firstChild;
      document.body.insertBefore(safaOverlay,firstElement);
  }
  const {browserType, browserVersion} = detectBrowser();
  var outdated_browser = false;
  if(browserType === 'Safari' && browserVersion <= 603) {
      outdated_browser = true;
      displayPopup();

  }
  var button = $('.loginButton');
  button.on('click keydown', function (event) {
    var load = function (event) {
      if(outdated_browser) return;
      var version = '<%= System.Configuration.ConfigurationManager.AppSettings["usbAppVersion"]%>';
      
      var deployedEnv = "https://onlinebanking.usbank.com";
      var APPD_KEY_IT_UAT = "AD-AAB-AAX-FJG";
      var APPD_KEY_PROD = "AD-AAB-AAX-FJH";

      version = version ? version.replace(/\./g, '') : "";
      if (require !== null || typeof require !== 'undefined') {
        require.config({
          urlArgs: '',
          baseUrl: '/content/usbank/',
          waitSeconds: 180,
          paths: {
            "react": "./LoginModuleHelpers/react.production.min",
            "react-dom": "./LoginModuleHelpers/react-dom.production.min",
            "axios": "./LoginModuleHelpers/axios.min",
			      "lodash": "./LoginModuleHelpers/lodash.min",
            "prop-types": "./LoginModuleHelpers/prop-types",
            "babel": "./LoginModuleHelpers/babel.6.15.0.min",
            "DS": deployedEnv + "/auth/login/wmf/micro-app-loader/dist/umd/index"
          },
          'shim': {
            "DS": {
              "deps": [
                "react",
                "react-dom",
                "axios",
                "babel"
              ],
              "exports": "DS"
            }
          }
        });
        window.process = {
          "env": {
            "NODE_ENV": 'production'
          }
        }
        
        var appKeyForAppD = (window.location.host.startsWith("it") || window.location.host.startsWith("uat"))
        ? APPD_KEY_IT_UAT : APPD_KEY_PROD;

        var akValue = "";
        if (window.location.host.startsWith("it")) {
          akValue = "6DnwT84FiPjKdOHJlxKkfCFxAsx62J15";
        }
        else if (window.location.host.startsWith("uat")) {
          akValue = "xGQGjOTjVjd9qEuAQjnCxxGYiyF7yFOK";
        }
        else {
          akValue = "lmGObVmU04tgtuY85pIvqMcovKNGo0m0";
        }
        require(["react", "react-dom", "prop-types", "axios", "lodash", "babel", "DS"
        ],
          function (React, ReactDOM, PropTypes, axios, lodash, babel, DS) {
            
            const header = {
              'Tenant-ID': 'USB',
              'App-ID': 'DOTCOM',
              'Channel-ID': 'web',
              'App-Version': '1.0',
              'AK': akValue,
              'Correlation-ID': 'aed086ea-9685-4671-814c-3eb86dc5c4fa'
            };
            
            // GET ROUTINGKEY
            function getRoutingKey() {    
              const parseUrl = window.location.origin.split("/")[2];
              return parseUrl && (parseUrl.startsWith("it") || parseUrl.startsWith("uat") || parseUrl.startsWith("emp") || parseUrl.startsWith("perf1") || parseUrl.startsWith("preprod")) ? parseUrl.split("-").length > 1 ? parseUrl.split("-")[0] : parseUrl.split(".")[0] : "Prod"
            }
            
            const configSettings = {
              transmitConfigs: {
                URL: '/Proxy/TS',
                APP_ID: 'web',
                BASE_API_URL: '',
                policyIds: {
                  POLICY: "password_login"
                },
                policyParams: {
                  clientId: "OLB",
                  visitorId: window.visitor ? window.visitor.getMarketingCloudVisitorID() : "",
                  routingKey: getRoutingKey(),
                  callRememberMeSBApi: true,
                  native: false,
                  kba: true,
                  tenantId: "USB",
                  appId: "DOTCOM",
                  channelId: "web",
                  appVersion: "1.0",
                  ver: 1,
                  eml: true,
                }
              },
              throttlePercentage: {
                  "EnrollmentThrottle": "100"
              },
              urls: {
                FARM_SIGN_UP_PATH:"",
                BASE_URL: deployedEnv,
                loginAssistance: {
                  FORGOT_ID: deployedEnv + '/OLS/LoginAssistant/RetriveId',
                  RESET_PASSWORD: deployedEnv + '/digital/loginhelp/',
                  UPDATE_CREDENTIALS_API: "https://auth-credentials-dev.us.bank-dns.com/digital-auth/services/credentials/v1/update",
                  LOGIN_HELP: deployedEnv + '/digital/loginhelp/',
                  CREATE_USERID_PASSWORD: deployedEnv + '/Auth/EnrollmentDesktop/Verification',
                  FORGOT_SHIELD_ANSWER: deployedEnv + '/digital/loginhelp/IDshield/',
                  IDENTIFYUSER: deployedEnv + '/digital/loginhelp/Identify/',
                  STATE_FARM_CUSTOMER: deployedEnv + '/OLS/Public/Enrollment/Index?isPartnerOLB=true'
                },
                dashboard: {
				     CUST_HUB_LANDING_PAGE: deployedEnv + '/Auth/CustHubLandingPage.aspx'
				 },
				 routerAppURL: deployedEnv + "/digital/servicing/feature-router/route",
         bauCustomerDashboardUrl: deployedEnv + "/digital/servicing/customer-dashboard",
         bauAccountDashboardUrl: deployedEnv + "/digital/servicing/account-dashboard",

              },
              regex: {
                PASSWORD: "^.{8,24}$",
              },
              displayFields: {
                REMEMBER_ME: "show",
                ENROLLMENT_LINK: "show",
                ACCOUNT_TYPE_DROPDOWN: "show",
                COMPANY_ID: "hide",
                LOGIN_HELP: "show",
                FORGOT_ID: "hide",
                RESET_PASSWORD: "hide",
                FARM_SIGN_UP: "hide"
              },
              lang: {
                  "en-us" : {
                    labels: {
                        HEADER_TAG: "h2"
                    }
                  }
              }
            }
            var configAPIURL = "";

            if (window.location.host.startsWith("it")) {
              configAPIURL = "https://it-api.usbank.com/authentication/customer-auth/app-config/v1/config";
            }
            else if (window.location.host.startsWith("uat")) {
              configAPIURL = "https://alpha-api.usbank.com/authentication/customer-auth/app-config/v1/config";
            }
            else {
              configAPIURL = "https://api.usbank.com/authentication/customer-auth/app-config/v1/config";
            }

            /* Props for the SiteCat - All the below 3 to be passed. If nothing is passed, then the empty string will be sent to SiteCat */
            const appNameForSiteCat = 'OLB';
            const uxNameForSiteCat = 'desktop';
            const clientNameForSiteCat = 'dotcom';
            window.custHubLandingPage = configSettings.urls.dashboard.CUST_HUB_LANDING_PAGE;
            window.routerAppURL = configSettings.urls.routerAppURL;
            window.bauCustomerDashboardUrl = configSettings.urls.bauCustomerDashboardUrl;
            window.bauAccountDashboardUrl = configSettings.urls.bauAccountDashboardUrl;
            
            function isCookiePresent(name) {
				    const cookieData = decodeURIComponent(document.cookie);
				    const cookiearr = cookieData.split(';');
				    const cookieItem = cookiearr.filter(function(value)  { 
				        return JSON.stringify(value).includes(name);
				        
				    })
				    return cookieItem.length > 0;
				    
			}
            function handleSession() {
                    // Code snippet to handle Transmit WebSDK backward compatability scenario on currentSession
                    const currentSession = sessionStorage.getItem('currentSession');
                              const parsedCurrentSession =(currentSession !==null && currentSession !== undefined && currentSession !== '') ? JSON.parse(currentSession) : '';
                              const localUserStorage = localStorage.getItem('users');
                              const parsedLocalUserStorage = (localUserStorage !== null && localUserStorage !== undefined && currentSession !== '') ? JSON.parse(localUserStorage) : ''; 

                              var parlStorageUsers = '';

                    if (parsedLocalUserStorage.length){
                      for (var index = 0; index < parsedLocalUserStorage.length; ++index) {
                        if(parsedLocalUserStorage[index].guid && parsedCurrentSession.user_guid && parsedLocalUserStorage[index].guid === parsedCurrentSession.user_guid) {
                      		parlStorageUsers = parsedLocalUserStorage[index];
                          	break;
                        }
                      }
                    }

                    const lUsersObj= {
                      user : parlStorageUsers
                    }
                    const userNameObj = {
                      user_name : sessionStorage.getItem('userId').toLowerCase()
                    }

                    if (typeof parsedCurrentSession == 'object' && !parsedCurrentSession.user){
                      const currentSessionUsers = Object.assign({}, parsedCurrentSession,lUsersObj,userNameObj);
                      sessionStorage.setItem('currentSession', JSON.stringify(currentSessionUsers))
                    }
                  }


            //CALLBACK METHOD TO HANDLE TRANSMIT REPSONSE
            function onTransmitAuthorizationSuccess(response) {
              handleSession();
              completeSignon(axios, response);
            }
            //CALLBACK METHOD TO HANDLE TRANSMIT REPSONSE
            function onTransmitAuthorizationFailure(response) {
            }

            function onLoginModuleLoaded() {
              console.log("Login Module loaded on Dotcom");
              $('.login-buttons button.loginButton').removeClass("widgetLoading").removeAttr("disabled").removeAttr('aria-label');
            }

            ReactDOM.render(
              React.createElement(
                  DS, {
                  elementRef: React.createRef(null),
                  id: "auth-login",
                  isDomainPrefixedToManifestPath: false,
                  manifestPath: deployedEnv + "/auth/login/wmf/latest/manifest.json",
                  namespace: "USBAuthLoginModule",
                  appProps: {
                      configApiHeaders: header,
                      configSettings: configSettings,
                      onAuthorizationSuccess: onTransmitAuthorizationSuccess,
                      onAuthorizationFailure: onTransmitAuthorizationFailure,
                      appNameForSiteCat: appNameForSiteCat,
                      uxNameForSiteCat: uxNameForSiteCat,
                      clientNameForSiteCat: clientNameForSiteCat,
                      isOLB: true,
                      isAppDEnabled: true,
                      appDKey: appKeyForAppD,
                      isReportingEnabled: true,
                      isIovationEnabled: true,
                      configApiURL: configAPIURL,
                      isJSLoggerEnabled: true,
                      jsLogEventSubType: 'DOTCOM',
                      isHeaderRequired: false,
							        isFooterRequired: false,
                      isShieldMFAEnabled: true,
                      isResetPasswordEnabled: true,
                      onLoginModuleLoaded: onLoginModuleLoaded
                  }
                }
              ), document.getElementById('LoginWidgetApp')
            );

            $('.loginWidgetModal').css('visibility', 'visible !important');
            $('.loginWidgetModal').show();

            //--------------------------------------------
            //Function parseJWT decodes JWT from transmit.
            //Extracts the UserID
            //--------------------------------------------
            function parseJwt(token) {
              var base64Url = token.split('.')[1];
              var base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              return JSON.parse(base64);
            };

            function readSessionStorageItemsForTransmit(jwtBodyJson, token) {
              var storage = window.sessionStorage;
              if (!storage) return null;
              else {
                var userId = jwtBodyJson.sub.toLowerCase();
                storage.setItem('ts:deviceId:' + userId, jwtBodyJson.did);
                storage.setItem('ts:usertkn', token);
                storage.setItem('ts:appid', jwtBodyJson.aud);
                storage.setItem('ts:userid', userId);
                storage.setItem('ts:sessionId:' + userId, jwtBodyJson.sid);
                storage.setItem('InteractionID', jwtBodyJson.InteractionId);
              }
              var length = storage.length;
              var params = [];
              for (var index = 0; index < length; ++index) {
                var key = storage.key(index);
                if (!key) continue;
                if (key.startsWith("ts:") || key.startsWith("currentSession")) {
                  var value = storage.getItem(key);
                  //replace <null> to null due to failure at server validation due to potential risk
                  params.push({ Key: key, Value: value.replace(/"/g, '\\"').replace(/<null>/g, 'null') });
                }
              }
              return params;
            }

            
            function redirectToFeatureRouter(token, tsParams, applicationFeatureFlags, userFeatureFlags) {
                var JwToken = token;
				var decodedToken = parseJwt(token);
				var applyUrl =	routerAppURL;								
				var Accesstoken = decodedToken.accesstoken;
				var PilotFlags = decodedToken.pilotflags || decodedToken.pilotFlags;
				var isDIYPilot = decodedToken.isDIYPilot;
				var interactionId = decodedToken.InteractionId;
				
				tsParams.find(function(obj) {
					if(obj.Key === 'ts:appid')
						appId = obj.Value;
					return;
				})
				tsParams.find(function(obj) {							
					if(obj.Key === 'ts:userid')
						userId = obj.Value;
					return;
				})
				tsParams.find(function(obj) {
					if(obj.Key === 'ts:deviceId'+':'+userId)
						devId = obj.Value;
					return;
				})
				tsParams.find(function(obj) {
					if(obj.Key === 'ts:sessionId'+':'+userId)
						sesId = obj.Value;								
					return;
				})
				
				var storage = window.sessionStorage;
				if(storage && storage.getItem("currentSession")) {
					curSession = storage.getItem("currentSession");
				}

        const localUserStorage = localStorage.getItem('users');

				var laform = document.createElement('form');
				laform.id = "laform";
				laform.method = "POST";
				laform.action = applyUrl;	

				var storageItems = document.createElement("INPUT");
				var redirectUrl = document.createElement("INPUT");
        var localStorageInp = document.createElement("INPUT");	

				var deviceParam = "ts:deviceId:"+ userId;
				var sessionParam = "ts:sessionId:"+ userId;

				var storageItemsObj= {
					"AccessToken": Accesstoken,
					"pilotflags": PilotFlags,
					"isDIYPilot": isDIYPilot,
					"ts:usertkn": JwToken,
					"ts:userid": userId,
					"currentSession": curSession,
					"ts:appid": appId,
          "InteractionID": interactionId,
          'applicationFeatureFlags': JSON.stringify(applicationFeatureFlags),
          'userFeatureFlags': JSON.stringify(userFeatureFlags),
          'UIEntryPointReturnURL': bauCustomerDashboardUrl,
          'AccountDashboardEntryPointURL': bauAccountDashboardUrl,
          "Channel": decodedToken.params.channelId === 'web' ? 'OLB' : decodedToken.params.channelId
        };
        
				
				storageItemsObj[deviceParam] = devId;
                storageItemsObj[sessionParam] = sesId;

                const getEnvAbbreviation = () => {
                  if (typeof window === 'undefined') {
                    return null
                  }
                  const { host } = window.location
                  return host.split(/[.,\\/ -]/)[0]
                }

                const getHost = () => {
                  const host = getEnvAbbreviation()
                  return host ? host.replace(/\d+|:/g, '') : '';
                }
                const env = getHost()
    
                const getDomain = {
                  it: "it-api.usbank.com",
                  uat: "alpha-api.usbank.com",
                  emp: "api.usbank.com",
                  prod: "api.usbank.com",
                  preprod: "api.usbank.com",
                  perf: "alpha-api.usbank.com",
                  pentest: "alpha-api.usbank.com"
                }

				storageItems.name = "storageItems";
				storageItems.value = JSON.stringify(storageItemsObj);
				storageItems.type = 'hidden';	
				redirectUrl.name = "redirectUrl";
				redirectUrl.value = bauCustomerDashboardUrl;									
				redirectUrl.type = 'hidden';		

        localStorageInp.name = "localStorage";
        localStorageInp.value = localUserStorage;
        localStorageInp.type = 'hidden';

				laform.appendChild(storageItems);
				laform.appendChild(redirectUrl);
        laform.appendChild(localStorageInp);
        
				document.body.appendChild(laform);
				laform.submit();	
			}
            
            //--------------------------------------------
            //Function to call signOnWithTransmit
            //Params: UserID, JWT, clientname, policy
            //
            //--------------------------------------------
           async function completeSignon(axios, response) {
              var url = window.location.origin;
              var jwtBodyJson = parseJwt(response.token);
              var userToken = response.token;
              var tsParams = readSessionStorageItemsForTransmit(jwtBodyJson, response.token);
              var isTempAccess = response.isTempAccess ? true : false;
              var storage = window.sessionStorage;
              var currentSession = storage && storage.getItem("currentSession") ? storage.getItem("currentSession") : null;
              var encodedCurrentSession = currentSession ? currentSession.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;") : null;
              var requestParams = {
                "Policy": "password_login",
                "ClientName": "OLB",
                "DeviceID": response.DeviceID,
                "Token": response.token,
                "UserId": jwtBodyJson.sub,
                "AppId": "web",                
                "TSParams": tsParams,
                "IsTempAccessFlow": isTempAccess,
                "EncodedCurrentSession": encodedCurrentSession,
                "IsGenerateDeviceToken": jwtBodyJson.isGenerateDeviceToken
              };
              var headers = {
                'Content-Type': "application/json"
              }
              var bid = jwtBodyJson.bid;

              const USER_ENABLED_FEATURES = {
                query: `query { userEnabledFeatures(finclsrvcftrcde:"",platform:"WEB"){
                features {
                  feature
                  platform
                  enabled
                }
              }
              }`
              }
               const APPLICATION_ENABLED_FEATURES = {
                 query: `query {
                applicationEnabledFeatures (finclsrvcftrcde:"", platform: "WEB"){
                  features {
                    feature
                    platform
                    enabled
                  }
                }
              }`,
               };

              const getEnvAbbreviation = () => {
                if (typeof window === 'undefined') {
                  return null
                }
                const { host } = window.location
                return host.split(/[.,\\/ -]/)[0]
              }

              const getHost = () => {
                const host = getEnvAbbreviation()
                return host ? host.replace(/\d+|:/g, '') : '';
              }
              const env = getHost()
  
              const getDomain = {
                it: "it-api.usbank.com",
                uat: "alpha-api.usbank.com",
                emp: "api.usbank.com",
                prod: "api.usbank.com",
                preprod: "api.usbank.com",
                perf: "alpha-api.usbank.com",
                pentest: "alpha-api.usbank.com"
              }

              var graphqlUrl = ''

                      if (window.location.host.startsWith("it")) {

                          graphqlUrl = "it-api.usbank.com";

                      }

                      else if (window.location.host.startsWith("uat")) {

                        graphqlUrl =  "alpha-api.usbank.com";

                      }

                      else {

                        graphqlUrl = "api.usbank.com";

                      }
					
            
              const getRoutingKey = (defaultKey = null) => {
                if(defaultKey === null) {
             	 return window && window.location ? window.location.hostname.split(/[.,-]/)[0] : null;
          	 }
              }
            
              const routingKeys = {
                it: getRoutingKey('it5'),
                uat: getRoutingKey('uat5'),
                localhost: getRoutingKey('it4'),
                perf: getRoutingKey(),
                pentest: getRoutingKey(),
                emp: getRoutingKey('emp'),
                preprod: getRoutingKey('preprod'),
                prod: ''
              }

              const fetchFeatureFlags = async (query) => {
                let result
                const response = await fetch(`https://${graphqlUrl}/customer-management/graphql/v1`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  authorization: `Bearer ${ jwtBodyJson && jwtBodyJson.accesstoken}`,
                                  routingKey: routingKeys[env] || routingKeys.prod
                                    },
                                body: JSON.stringify(query)
                              })
                        if (response && response.ok) {
                        const res = await response.json()
                          result = res
                        } else {
                          result = {}
                        }
                        return result
                    }
                if(!isTempAccess && !bid) {
                  if (jwtBodyJson.isGenerateDeviceToken) {
                    let response
                    try {
                        response = await axios.post(url + "/Auth/Signon/SignonWithTransmit", JSON.stringify(requestParams), { headers: headers })
                            if (response && response.status === 200) {
                              const userFeatureFlags = await fetchFeatureFlags(USER_ENABLED_FEATURES)
                              const applicationFeatureFlags = await fetchFeatureFlags(APPLICATION_ENABLED_FEATURES)
                              const userFeature = userFeatureFlags.data && userFeatureFlags.data.userEnabledFeatures && userFeatureFlags.data.userEnabledFeatures.features;
                              const applicationFeature = applicationFeatureFlags.data && applicationFeatureFlags.data.applicationEnabledFeatures && applicationFeatureFlags.data.applicationEnabledFeatures.features;
                              redirectToFeatureRouter(userToken, tsParams, applicationFeature, userFeature);
                              } else {
                                console.log('Something went wrong during redirect to DIY dashboard for a pilot User');
                            }
                            return;
                          } catch (error) {
                            if (response && response.status !== 200) {
                              console.log('Something went wrong during redirect to DIY dashboard for a pilot User');
                            } else {
                              redirectToFeatureRouter(userToken, tsParams)
                            }
                          }
                    } else {
                      const userFeatureFlags = await fetchFeatureFlags(USER_ENABLED_FEATURES)
                      const applicationFeatureFlags = await fetchFeatureFlags(APPLICATION_ENABLED_FEATURES)
                      const userFeature = userFeatureFlags.data && userFeatureFlags.data.userEnabledFeatures && userFeatureFlags.data.userEnabledFeatures.features;
                      const applicationFeature = applicationFeatureFlags.data && applicationFeatureFlags.data.applicationEnabledFeatures && applicationFeatureFlags.data.applicationEnabledFeatures.features;
                 
                      redirectToFeatureRouter(userToken, tsParams, applicationFeature, userFeature);
                                        return;
    				      }
              } else {
                  axios.post(url + "/Auth/Signon/SignonWithTransmit", JSON.stringify(requestParams), { headers: headers })
                    .then(function (response) {
                      if (response && response.data && response.data.RedirectUrl) {
    
                       var accessToken = jwtBodyJson.accesstoken;                             
                        var redirectUrl = response.data.RedirectUrl;
                        redirectUrl += (redirectUrl.indexOf("?") < 0) ? '?tsParams=true' : '&tsParams=true';
                        window.location = redirectUrl;
                      }
                    })
                    .catch(function (error) {
                    });
              }
            };
          }
        );
      }
    };
    switch (event.type) {
      case 'click': load(event); break;
      case 'keydown':
        switch (event.key || event.which || event.code || event.keyCode) {
          case 'Enter': case 13: event.preventDefault(); load(event); break;    
          case 'Spacebar': case 'Space': case ' ': case 32: event.preventDefault(); load(event); break;
          default: break;
        }; break;
      default: break;
    }
  });
});
