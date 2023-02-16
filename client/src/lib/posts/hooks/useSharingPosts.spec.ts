import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {renderHook, act} from '@testing-library/react-hooks';
import {Post} from '../../../../../shared/src/types/Post';
import {AsyncSession} from '../../../../../shared/src/types/Session';
import {
  FeedbackPayload,
  PostPayload,
} from '../../../../../shared/src/types/Event';
import useSessionState from '../../session/state/state';
import useUserState from '../../user/state/state';
import {fetchPosts, addPost} from '../api/posts';
import useSharingPosts from './useSharingPosts';

jest.mock('../api/posts');

const mockFetchPosts = jest.mocked(fetchPosts);
const mockAddPost = jest.mocked(addPost);

afterEach(() => {
  jest.clearAllMocks();
});

describe('useSharingPosts', () => {
  describe('getSharingPosts', () => {
    it('should return fetched posts', async () => {
      mockFetchPosts.mockResolvedValueOnce([
        {
          id: 'some-post-id',
        } as Post,
      ]);
      const {result} = renderHook(() => useSharingPosts('some-exercise-id'));

      await act(async () => {
        const posts = await result.current.getSharingPosts();

        expect(posts).toEqual([{id: 'some-post-id'}]);
        expect(mockFetchPosts).toHaveBeenCalledTimes(1);
        expect(mockFetchPosts).toHaveBeenCalledWith('some-exercise-id');
      });
    });

    it('should return empty list if no exerciseId', async () => {
      const {result} = renderHook(() => useSharingPosts(undefined));

      await act(async () => {
        const posts = await result.current.getSharingPosts();

        expect(posts).toEqual([]);
        expect(mockFetchPosts).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('addSharingPost', () => {
    it('should add public post', async () => {
      useSessionState.setState({
        asyncSession: {id: 'some-session-id'} as AsyncSession,
      });
      useUserState.setState({
        user: {uid: 'some-user-id'} as FirebaseAuthTypes.User,
        userState: {
          'some-user-id': {},
        },
      });
      const {result} = renderHook(() => useSharingPosts('some-exercise-id'));

      await act(async () => {
        await result.current.addSharingPost(
          'some-sharing-id',
          'some text',
          true,
          false,
        );
      });

      expect(mockAddPost).toHaveBeenCalledTimes(1);
      expect(mockAddPost).toHaveBeenCalledWith(
        'some-exercise-id',
        'some-sharing-id',
        'some text',
        false,
      );
      expect(
        useUserState.getState().userState['some-user-id'].userEvents,
      ).toEqual([
        {
          type: 'post',
          payload: {
            exerciseId: 'some-exercise-id',
            sharingId: 'some-sharing-id',
            sessionId: 'some-session-id',
            isPublic: true,
            isAnonymous: false,
            text: 'some text',
          } as PostPayload,
          timestamp: expect.any(Date),
        },
      ]);
    });

    it('should add non public post', async () => {
      useSessionState.setState({
        asyncSession: {id: 'some-session-id'} as AsyncSession,
      });
      useUserState.setState({
        user: {uid: 'some-user-id'} as FirebaseAuthTypes.User,
        userState: {
          'some-user-id': {},
        },
      });
      const {result} = renderHook(() => useSharingPosts('some-exercise-id'));

      await act(async () => {
        await result.current.addSharingPost(
          'some-sharing-id',
          'some text',
          false,
          false,
        );
      });

      expect(mockAddPost).toHaveBeenCalledTimes(0);
      expect(
        useUserState.getState().userState['some-user-id'].userEvents,
      ).toEqual([
        {
          type: 'post',
          payload: {
            exerciseId: 'some-exercise-id',
            sharingId: 'some-sharing-id',
            sessionId: 'some-session-id',
            isPublic: false,
            isAnonymous: false,
            text: 'some text',
          } as PostPayload,
          timestamp: expect.any(Date),
        },
      ]);
    });

    it('should not add if exercise id is missing', async () => {
      useSessionState.setState({
        asyncSession: {id: 'some-session-id'} as AsyncSession,
      });
      useUserState.setState({
        user: {uid: 'some-user-id'} as FirebaseAuthTypes.User,
        userState: {
          'some-user-id': {},
        },
      });
      const {result} = renderHook(() => useSharingPosts(undefined));

      await result.current.addSharingPost(
        'some-sharing-id',
        'some text',
        true,
        false,
      );

      expect(mockAddPost).toHaveBeenCalledTimes(0);
      expect(useUserState.getState().userState['some-user-id'].userEvents).toBe(
        undefined,
      );
    });

    it('should not add if session is not set', async () => {
      useSessionState.setState({
        asyncSession: undefined,
      });
      useUserState.setState({
        user: {uid: 'some-user-id'} as FirebaseAuthTypes.User,
        userState: {
          'some-user-id': {},
        },
      });
      const {result} = renderHook(() => useSharingPosts('some-exercise-id'));

      await result.current.addSharingPost(
        'some-sharing-id',
        'some text',
        true,
        false,
      );

      expect(mockAddPost).toHaveBeenCalledTimes(0);
      expect(useUserState.getState().userState['some-user-id'].userEvents).toBe(
        undefined,
      );
    });
  });

  describe('getSharingPostForSession', () => {
    it('should filter out relevant sharing post events', () => {
      useUserState.setState({
        user: {uid: 'some-user-id'} as FirebaseAuthTypes.User,
        userState: {
          'some-user-id': {
            userEvents: [
              {
                type: 'feedback',
                payload: {} as FeedbackPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-exercise-id',
                  sessionId: 'some-session-id',
                  sharingId: 'some-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-other-exercise-id',
                  sessionId: 'some-session-id',
                  sharingId: 'some-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-exercise-id',
                  sessionId: 'some-ohter-session-id',
                  sharingId: 'some-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-exercise-id',
                  sessionId: 'some-session-id',
                  sharingId: 'some-ohter-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
            ],
          },
        },
      });

      const {result} = renderHook(() => useSharingPosts('some-exercise-id'));

      const posts = result.current.getSharingPostForSession(
        'some-session-id',
        'some-sharing-id',
      );

      expect(posts).toEqual({
        type: 'post',
        payload: {
          exerciseId: 'some-exercise-id',
          sessionId: 'some-session-id',
          sharingId: 'some-sharing-id',
        },
        timestamp: expect.any(Date),
      });
    });
  });

  describe('getSharingPostForExcercise', () => {
    it('should filter out relevant sharing post events', () => {
      useUserState.setState({
        user: {uid: 'some-user-id'} as FirebaseAuthTypes.User,
        userState: {
          'some-user-id': {
            userEvents: [
              {
                type: 'feedback',
                payload: {} as FeedbackPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-exercise-id',
                  sessionId: 'some-session-id',
                  sharingId: 'some-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-exercise-id',
                  sessionId: 'some-other-session-id',
                  sharingId: 'some-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-exercise-id',
                  sessionId: 'some-session-id',
                  sharingId: 'some-other-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
              {
                type: 'post',
                payload: {
                  exerciseId: 'some-other-exercise-id',
                  sessionId: 'some-session-id',
                  sharingId: 'some-ohter-sharing-id',
                } as PostPayload,
                timestamp: new Date(),
              },
            ],
          },
        },
      });

      const {result} = renderHook(() => useSharingPosts('some-exercise-id'));

      const posts =
        result.current.getSharingPostsForExercise('some-sharing-id');

      expect(posts).toEqual([
        {
          type: 'post',
          payload: {
            exerciseId: 'some-exercise-id',
            sessionId: 'some-session-id',
            sharingId: 'some-sharing-id',
          },
          timestamp: expect.any(Date),
        },
        {
          type: 'post',
          payload: {
            exerciseId: 'some-exercise-id',
            sessionId: 'some-other-session-id',
            sharingId: 'some-sharing-id',
          },
          timestamp: expect.any(Date),
        },
      ]);
    });
  });
});
