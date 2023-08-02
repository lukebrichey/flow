import Timer from '../components/Timer';
import Button from '../components/Button';
import { ArrowSmallLeftIcon } from '@heroicons/react/20/solid';

export default function Focus(): JSX.Element {
  return (
    <div>
      <Timer />
      <Button route="/" name="Back to Home" icon={<ArrowSmallLeftIcon className="h-6 w-6" />} />
    </div>
  );
}
