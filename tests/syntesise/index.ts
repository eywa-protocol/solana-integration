import {
  CreateRepresentationTests,
} from './create-representation';
import {
  MintSyntheticTokenTests,
} from './mint-synthetic-token';


export const SyntesiseTests = ({
  provider,
  admin,
  // apSettings,
}) => {
  CreateRepresentationTests({
    provider,
    admin,
    // apSettings,
  });
  MintSyntheticTokenTests({
    provider,
    admin,
    // apSettings,
  });
};
