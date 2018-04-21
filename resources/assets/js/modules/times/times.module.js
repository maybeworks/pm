import 'angular';
import TimesConfig from "./times.config";
import TimesListComponent from './components/list/times-list.component';
import TimesProjectSettingsComponent from './components/project-settings/times-project-settings.component';

angular.module('app.modules.times', [])
    .config(TimesConfig.inst())
    .component(TimesProjectSettingsComponent.getName(), TimesProjectSettingsComponent)
    .component(TimesListComponent.getName(), TimesListComponent);