              {/* Users Management Section */}
              {activeSection === "users" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">User Management</h2>
                    <Button size="sm" variant="outline" className="border-crypto-blue text-crypto-blue">
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                  
                  <Card className="bg-crypto-card border-gray-700">
                    <CardContent className="p-6">
                      {usersLoading ? (
                        <div className="text-center py-8">Loading users...</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-600">
                              <TableHead className="text-gray-300">User</TableHead>
                              <TableHead className="text-gray-300">Email</TableHead>
                              <TableHead className="text-gray-300">Balance</TableHead>
                              <TableHead className="text-gray-300">Status</TableHead>
                              <TableHead className="text-gray-300">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adminUsers?.map((adminUser: any) => (
                              <TableRow key={adminUser.id} className="border-gray-600">
                                <TableCell className="text-white">{adminUser.username}</TableCell>
                                <TableCell className="text-gray-300">{adminUser.email}</TableCell>
                                <TableCell className="text-crypto-green">${parseFloat(adminUser.balance).toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge className={adminUser.isActive ? "bg-crypto-green" : "bg-red-600"}>
                                    {adminUser.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button size="sm" variant="outline" className="border-crypto-blue text-crypto-blue mr-2">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Plans Management Section */}
              {activeSection === "plans" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Investment Plans Management</h2>
                    <Button 
                      size="sm" 
                      className="crypto-gradient"
                      onClick={() => setIsAddPlanDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Plan
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans?.map((plan: any) => (
                      <Card key={plan.id} className="bg-crypto-card border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                            <Badge className="bg-crypto-green">Active</Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Daily Return</span>
                              <span className="text-crypto-green font-bold">{plan.profit_percentage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Duration</span>
                              <span className="text-white">{plan.duration_days} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Min Investment</span>
                              <span className="text-white">${plan.min_deposit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Max Investment</span>
                              <span className="text-white">${plan.max_deposit}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex-1 border-crypto-blue text-crypto-blue">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Deposits Section */}
              {activeSection === "deposits" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Deposit Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-crypto-card border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm text-gray-400">Today's Deposits</h3>
                          <Wallet className="w-5 h-5 text-crypto-green" />
                        </div>
                        <div className="text-2xl font-bold text-white">$12,847</div>
                        <div className="text-sm text-crypto-green">+18% from yesterday</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-crypto-card border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm text-gray-400">Pending Deposits</h3>
                          <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-2xl font-bold text-white">7</div>
                        <div className="text-sm text-gray-400">Awaiting confirmation</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-crypto-card border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm text-gray-400">Total Volume</h3>
                          <TrendingUp className="w-5 h-5 text-crypto-blue" />
                        </div>
                        <div className="text-2xl font-bold text-white">$847K</div>
                        <div className="text-sm text-crypto-green">This month</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-crypto-card border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Deposits</h3>
                      <div className="space-y-3">
                        {deposits?.slice(0, 10).map((deposit: any) => (
                          <div key={deposit.id} className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg">
                            <div>
                              <div className="text-white font-medium">${parseFloat(deposit.usdValue).toLocaleString()}</div>
                              <div className="text-sm text-gray-400">{deposit.cryptocurrency} • {deposit.username}</div>
                            </div>
                            <div className="text-right">
                              <Badge className={deposit.status === "confirmed" ? "bg-crypto-green" : "bg-yellow-600"}>
                                {deposit.status}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(deposit.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Withdrawals Section */}
              {activeSection === "withdrawals" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Withdrawal Management</h2>
                  
                  <Card className="bg-crypto-card border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Pending Withdrawals</h3>
                      {pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                        <div className="space-y-4">
                          {pendingWithdrawals.map((withdrawal: any) => (
                            <div key={withdrawal.id} className="p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-lg font-semibold text-white">${parseFloat(withdrawal.usdValue).toLocaleString()}</div>
                                  <div className="text-sm text-gray-400">{withdrawal.cryptocurrency} withdrawal</div>
                                  <div className="text-xs text-gray-500 truncate max-w-xs">To: {withdrawal.walletAddress}</div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-crypto-green hover:bg-crypto-green/80"
                                    onClick={() => handleWithdrawalAction(withdrawal.id, "approved")}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleWithdrawalAction(withdrawal.id, "rejected", "Rejected by admin")}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <div>No pending withdrawals</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Referrals Section */}
              {activeSection === "referrals" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Referral System Control</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-crypto-card border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm text-gray-400">Total Referrals</h3>
                          <Gift className="w-5 h-5 text-crypto-green" />
                        </div>
                        <div className="text-2xl font-bold text-white">2,847</div>
                        <div className="text-sm text-crypto-green">+124 this week</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-crypto-card border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm text-gray-400">Referral Earnings</h3>
                          <DollarSign className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-2xl font-bold text-white">$18,492</div>
                        <div className="text-sm text-gray-400">Total paid out</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-crypto-card border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm text-gray-400">Conversion Rate</h3>
                          <TrendingUp className="w-5 h-5 text-crypto-blue" />
                        </div>
                        <div className="text-2xl font-bold text-white">34.7%</div>
                        <div className="text-sm text-crypto-green">Above average</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-crypto-card border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Referral Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-gray-300">Referral Commission (%)</Label>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            className="bg-crypto-dark border-gray-600 text-white" 
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Minimum Referral Payout ($)</Label>
                          <Input 
                            type="number" 
                            placeholder="25" 
                            className="bg-crypto-dark border-gray-600 text-white" 
                          />
                        </div>
                      </div>
                      <Button className="crypto-gradient mt-4">
                        Update Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}