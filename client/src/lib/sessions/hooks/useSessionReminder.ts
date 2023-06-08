import dayjs from 'dayjs';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {LiveSessionType} from '../../../../../shared/src/schemas/Session';
import useExerciseById from '../../content/hooks/useExerciseById';
import useTriggerNotifications from '../../notifications/hooks/useTriggerNotifications';
import {NOTIFICATION_CHANNELS} from '../../notifications/constants';
import useNotificationsState from '../../notifications/state/state';
import useLogSessionReminderEvents from '../../reminders/hooks/useLogSessionReminderEvents';

const useSessionReminder = (session: LiveSessionType) => {
  const {id, exerciseId, startTime, link} = session;

  const {t} = useTranslation('Notification.SessionReminder');
  const exercise = useExerciseById(exerciseId);

  const {setTriggerNotification, removeTriggerNotification} =
    useTriggerNotifications();
  const logSessionReminderEvents = useLogSessionReminderEvents();

  const reminderEnabled = Boolean(
    useNotificationsState(state => state.notifications[id]),
  );

  const toggleReminder = useCallback(
    async (enable = true) => {
      if (enable) {
        setTriggerNotification(
          id,
          NOTIFICATION_CHANNELS.SESSION_REMINDERS,
          t('title', {
            exercise: exercise?.name,
            host: session.hostProfile?.displayName,
          }),
          t('body'),
          link,
          session.hostProfile?.photoURL,
          dayjs(startTime).subtract(10, 'minutes').valueOf(),
        );
      } else {
        removeTriggerNotification(id);
      }
      logSessionReminderEvents('Session reminders toggle', enable);
    },
    [
      setTriggerNotification,
      removeTriggerNotification,
      id,
      exercise?.name,
      session.hostProfile?.photoURL,
      session.hostProfile?.displayName,
      link,
      startTime,
      t,
      logSessionReminderEvents,
    ],
  );

  return {reminderEnabled, toggleReminder};
};

export default useSessionReminder;
