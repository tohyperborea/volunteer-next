import { render } from '@testing-library/react';
import SlideIn from './index';

describe('SlideIn Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <SlideIn>
        <div>Test Child</div>
      </SlideIn>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('applies the correct class for transition', () => {
    const { container } = render(
      <SlideIn>
        <div>Test Child</div>
      </SlideIn>
    );

    expect(container.firstChild).toHaveClass('easeInTransition');
  });
});
