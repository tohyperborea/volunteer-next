import { render, screen, fireEvent } from '@testing-library/react';
import LinkMenu, { SubLinkMenu } from './index';

describe('LinkMenu', () => {
  it('renders a list of children', () => {
    render(
      <LinkMenu>
        <a href="/link1">Link 1</a>
        <a href="/link2">Link 2</a>
      </LinkMenu>
    );

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('Link 1');
    expect(listItems[1]).toHaveTextContent('Link 2');
  });

  it('renders a single child correctly', () => {
    render(
      <LinkMenu>
        <a href="/link1">Link 1</a>
      </LinkMenu>
    );

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).toHaveTextContent('Link 1');
  });
});

describe('SubLinkMenu', () => {
  it('renders the title and toggles the submenu', () => {
    render(
      <SubLinkMenu title="Menu Title">
        <a href="/sublink1">SubLink 1</a>
        <a href="/sublink2">SubLink 2</a>
      </SubLinkMenu>
    );

    const button = screen.getByRole('button', { name: /menu title/i });
    expect(button).toBeInTheDocument();

    // Initially, submenu should not be visible
    expect(screen.queryByText('SubLink 1')).not.toBeVisible();
    expect(screen.queryByText('SubLink 2')).not.toBeVisible();

    // Click to open the submenu
    fireEvent.click(button);
    expect(screen.getByText('SubLink 1')).toBeVisible();
    expect(screen.getByText('SubLink 2')).toBeVisible();

    // Click again to close the submenu
    fireEvent.click(button);
    expect(screen.queryByText('SubLink 1')).not.toBeVisible();
    expect(screen.queryByText('SubLink 2')).not.toBeVisible();
  });

  it('renders a single child in the submenu', () => {
    render(
      <SubLinkMenu title="Menu Title">
        <a href="/sublink1">SubLink 1</a>
      </SubLinkMenu>
    );

    const button = screen.getByRole('button', { name: /menu title/i });
    fireEvent.click(button);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).toHaveTextContent('SubLink 1');
  });
});
