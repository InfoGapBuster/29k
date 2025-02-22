import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import useAppState from '../../appState/state/state';
import {LANGUAGE_TAGS} from '../../i18n';
import {PUBLISHABLE_NAMESPACES} from '../../../../../shared/src/content/constants';

const useToggleHiddenContent = () => {
  const {i18n} = useTranslation();
  const setSettings = useAppState(state => state.setSettings);

  const toggleHiddenContent = useCallback(
    (on: boolean) => {
      setSettings({showHiddenContent: on});
      // Needs to be removed for all languages,
      // otherwise they are not reloaded when switching language
      LANGUAGE_TAGS.forEach(lng => {
        PUBLISHABLE_NAMESPACES.forEach(namespace => {
          i18n.removeResourceBundle(lng, namespace);
        });
      });
      i18n.reloadResources(undefined, PUBLISHABLE_NAMESPACES);
    },
    [i18n, setSettings],
  );

  return toggleHiddenContent;
};

export default useToggleHiddenContent;
