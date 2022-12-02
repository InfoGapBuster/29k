import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components/native';
import {COLORS} from '../../../../shared/src/constants/colors';
import Button from '../../common/components/Buttons/Button';
import Gutters from '../../common/components/Gutters/Gutters';
import Image from '../../common/components/Image/Image';
import Screen from '../../common/components/Screen/Screen';
import {
  BottomSafeArea,
  Spacer16,
  Spacer20,
  Spacer32,
  Spacer40,
  TopSafeArea,
} from '../../common/components/Spacers/Spacer';
import {Display24} from '../../common/components/Typography/Display/Display';
import Markdown from '../../common/components/Typography/Markdown/Markdown';
import useAppState from '../../lib/appState/state/state';

const Wrapper = styled(Gutters).attrs({big: true})({
  flex: 1,
  justifyContent: 'space-between',
});
const TopImage = styled(Image)({
  flex: 1,
  alignSelf: 'center',
  aspectRatio: '1',
});
const CenteredHeading = styled(Display24)({
  textAlign: 'center',
});
const ButtonWrapper = styled.View({
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
});

const Welcome = () => {
  const {t} = useTranslation('Screen.Welcome');
  const setSettings = useAppState(state => state.setSettings);

  const onContinue = useCallback(() => {
    setSettings({showWelcome: false});
  }, [setSettings]);

  return (
    <Screen backgroundColor={COLORS.CREAM}>
      <TopSafeArea />
      <Wrapper>
        <Spacer32 />
        <TopImage source={{uri: t('image__image')}} />
        <Spacer20 />
        <CenteredHeading>{t('heading')}</CenteredHeading>
        <Spacer16 />
        <Markdown>{t('text__markdown')}</Markdown>
        <ButtonWrapper>
          <Button onPress={onContinue}>{t('button')}</Button>
        </ButtonWrapper>
        <Spacer40 />
      </Wrapper>
      <BottomSafeArea />
    </Screen>
  );
};
export default Welcome;
