/*
 * Copyright (C) 2015 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react'
import {shape, func, string} from 'prop-types'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'
import UsersList from './UsersList'
import UsersToolbar from './UsersToolbar'
import SearchMessage from './SearchMessage'
import UsersPaneContext from '../context/userspane-context'
import { useQuery } from '@apollo/react-hooks';
import { USERS_QUERY } from '../graphql/queries';
import Spinner from '@instructure/ui-elements/lib/components/Spinner';
import View from '@instructure/ui-layout/lib/components/View';

export const MIN_SEARCH_LENGTH = 3

const UsersPane = props => {
  const [srMessageDisplayed, setSrMessageDisplayed] = useState(false);
  const [searchFilter, setSearchFilter] = useState({search_term: ''});
  const [searchTermTooShort, setSearchTermTooShort] = useState(false);

  const updateQueryString = () => {
    props.onUpdateQueryParams(searchFilter)
  }

  useEffect(() => {
    const {search_term, role_filter_id} = {...UsersToolbar.defaultProps, ...props.queryParams}
    setSearchFilter({search_term, role_filter_id});
  }, [])

  useEffect(() => {
    updateQueryString()
  }, [ searchFilter ])

  const { loading, error, data, refetch } = useQuery(USERS_QUERY, 
    { variables: { 
      page: searchFilter.page ? searchFilter.page : 1, 
      search_term: searchFilter.search_term.length >= MIN_SEARCH_LENGTH ? searchFilter.search_term : "",
      order: searchFilter.order,
      sort: searchFilter.sort,
      role_filter_id: searchFilter.role_filter_id
    } }
  );

  if (error) {
    return <p>error :(</p>;
  }
  const handleUpdateSearchFilter = filter => {
    setSearchFilter({...searchFilter, ...filter, page: null});
    if ( filter && filter.search_term && filter.search_term.length < MIN_SEARCH_LENGTH  ) {
      setSearchTermTooShort(true);
    } else {
      setSearchTermTooShort(false);
    }
  }

  const handleSubmitUserForm = (attributes, id) => {
    refetch();
  }

  const handleSetPage = page => {
    setSearchFilter({...searchFilter, page });
  }

  return (
    <div>
      <ScreenReaderContent>
        <h1>{'People'}</h1>
      </ScreenReaderContent>
      <UsersPaneContext.Provider value={{
        handleSubmitUserForm: handleSubmitUserForm,
        onUpdateFilters: handleUpdateSearchFilter
      }}>
      {
        <UsersToolbar
          errors={searchTermTooShort ? {search_term: "Search message too short"} : {}}
          {...searchFilter}
          toggleSRMessage={(show = false) => {
            setSrMessageDisplayed(show);
          }}
        />
      }
      {loading ?
        <View display="block" textAlign="center" padding="medium">
          <Spinner size="medium" title={'Loading...'} />
        </View> : 
        <><UsersList
          users={data.users.users}
          searchFilter={searchFilter}
          noneFoundMessage={'No users found'}
        />
        <SearchMessage
          users={data.users.users}
          links={data.users.links}
          searchFilter={searchFilter}
          setPage={handleSetPage}
          dataType="User"
        /></>
      }
      </UsersPaneContext.Provider>
    </div>
  )
}

UsersPane.propTypes = {
  onUpdateQueryParams: func.isRequired,
  queryParams: shape({
    page: string,
    search_term: string,
    role_filter_id: string
  }).isRequired
}

export default UsersPane;