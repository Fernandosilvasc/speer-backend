import { Factory } from 'fishery';
import TweetEntity from '../../../../commons/persistence/tweet.entity';

export default Factory.define<TweetEntity>(({ sequence }) => ({
  id: sequence.toString(),
  text: 'textTest',
  authorId: '',
  createdAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
}));
