import * as React from 'react';
import {Path} from 'react-native-svg';
import {IconType} from '..';
import {COLORS} from '../../../../../../shared/src/constants/colors';
import Icon from '../Icon';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';

export const LogoIcon: IconType = ({fill = COLORS.BLACK}) => (
  <Icon>
    <Path
      fill={fill}
      d="M21.217 23.91c-3.873 1.001-6.76-.244-8.706-2.374-1.995-2.184-2.65-5.364-1.734-8.146-2.959 3.131-2.613 7.25-.428 9.862 2.475 2.96 7.238 4.043 10.868.658Z"
    />
    <Path
      fill={fill}
      d="M10.553 24.798c-2.805-2.854-3.169-5.976-2.298-8.727.894-2.82 3.32-4.977 6.188-5.575-4.191-.996-7.586 1.363-8.755 4.56-1.325 3.624.118 8.29 4.865 9.742Z"
    />
    <Path
      fill={fill}
      d="M4.451 16.006c1.07-3.856 3.591-5.732 6.41-6.353 2.888-.636 5.97.386 7.921 2.57-1.233-4.127-4.973-5.887-8.327-5.301-3.8.664-7.12 4.248-6.004 9.084Z"
    />
    <Path
      fill={fill}
      d="M9.015 6.325c3.873-1.001 6.76.245 8.705 2.374 1.947 2.13 2.651 5.364 1.735 8.146 2.959-3.131 2.612-7.25.428-9.862-2.475-2.96-7.239-4.043-10.868-.658Z"
    />
    <Path
      fill={fill}
      d="M19.679 5.438c2.804 2.853 3.168 5.976 2.297 8.726-.893 2.82-3.32 4.978-6.187 5.575 4.19.996 7.585-1.363 8.755-4.56 1.325-3.624-.119-8.29-4.865-9.741Z"
    />
    <Path
      fill={fill}
      d="M25.78 14.23c-1.068 3.855-3.59 5.732-6.408 6.352-2.89.637-5.97-.386-7.922-2.57 1.233 4.127 4.973 5.887 8.327 5.302 3.8-.665 7.12-4.248 6.004-9.084Z"
    />
  </Icon>
);

type LogoAnimatedProps = {fill?: string};
export const LogoIconAnimated = React.memo<LogoAnimatedProps>(({fill}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {duration: 30000, easing: Easing.linear}),
      -1,
      false,
    );
  });

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{rotateZ: `${rotation.value}deg`}],
    }),
    [rotation.value],
  );

  return (
    <Animated.View style={animatedStyle}>
      <LogoIcon fill={fill} />
    </Animated.View>
  );
});
