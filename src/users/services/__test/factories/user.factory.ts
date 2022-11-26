import { Factory } from 'fishery';
import UserEntity from '../../../../commons/persistence/user.entity';

export default Factory.define<UserEntity>(({ sequence }) => ({
  id: sequence.toString(),
  username: 'testUsername',
  hash: 'hashedCode123',
  hashedRT: null,
  createdAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
}));
