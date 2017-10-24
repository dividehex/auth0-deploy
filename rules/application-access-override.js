function (user, context, callback) {
  if (!user) {
    // If the user is not presented (i.e. a rule deleted it), just go on, since authenticate will always fail.
    return callback(null, null, context);
  }

  // Applications that are restricted
  // The rule must cover both dev and prod client_ids as the rule is merged from dev to prod.
  var STAFF_APPS = [
    // Examples:
    //'0123456789abcdefghijKLMNOPQRSTuv',  // auth : egencia.com
    //'123456789abcdefghijKLMNOPQRSTuvw',  // auth-dev : egencia.com
    'WXVdgVoCca11OtpGlK8Ir3pR9CBAlSA5', // auth : https://mozilla.slack.com
    'AL3fXafFNeSp83gZmuR7ZXm5DI70TZyG', // auth : phonebook-dev.allizom.org
    '00fgOKsjo530sIxfhsved8jyTjAD0av2', // auth : phonebook.allizom.org
    'K7vKewjQHKe45mmOo5cRae6yyOvnmg74', // auth : phonebook.mozilla.org
  ];
  // LDAP groups allowed to access these applications
  var ALLOWED_GROUPS = [
    // Examples:
    //'team_moco', 'team_mofo'
    'team_moco', 'team_mofo', 'team_mozillajapan', 'team_mozillaonline', 'team_nda'
  ];

  if (STAFF_APPS.indexOf(context.clientID) >= 0) {
    var groupHasAccess = ALLOWED_GROUPS.some(
      function (group) {
        if (!user.groups)
          return false;
        return user.groups.indexOf(group) >= 0;
    });
    if (groupHasAccess) {
     return callback(null, user, context);
    } else {
     // Since this rule should only be used for RPs which can not do the
     // authorization check themselves, and these types of RPs will likely
     // also be unable to interpret the UnauthorizedError() `error` and
     // `error_description` arguments passed back and will consequently
     // not show the user why their login failed, the user is redirected
     // instead of using UnauthorizedError() [1]
     // 1: https://auth0.com/docs/rules#deny-access-based-on-a-condition
     context.redirect = {
       url: "https://sso.mozilla.com/forbidden"
     };
     return callback(null, null, context);
    }
  }
  callback(null, user, context);
}
