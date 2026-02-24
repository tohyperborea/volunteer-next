import { Card, Text } from '@radix-ui/themes';

interface Props {
  team: TeamInfo;
}

export default function TeamInfo({ team }: Props) {
  return (
    <Card>
      <Text>{team.description}</Text>
    </Card>
  );
}
