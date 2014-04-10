'use strict';

describe('Directive: redactor', function () {

  // load the directive's module
  beforeEach(module('frmsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<redactor></redactor>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the redactor directive');
  }));
});
