import { getReleases } from '../../lib/changelog';
import ReleaseList from './ReleaseList';

export default async function Page() {
  const releases = await getReleases();

  return <ReleaseList releases={releases} />;
}
